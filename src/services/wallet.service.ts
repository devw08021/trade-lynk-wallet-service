import { getRepository } from "@/models/repositoryFactory";
import { WalletModel, CurrencyModel } from "@/models/schemas/index";
import { incBalanceRedis, decBalanceRedis, redis } from '@/config/redis'
import { CurrencyDocument } from "@/models/schemas/currency";

const BALANCELOG = 'balance_logs';
const BALANCEGROUP = 'balance_group';
const BALANCECONSUMER = 'balance_sync_worker'

interface WalletResponse {
  success: boolean;
  message: string;
  code: number;
  data: any;
}

export class WalletService {
  private walletRep = getRepository(WalletModel);
  private currencyRep = getRepository(CurrencyModel);

  private createErrorResponse(message: string, code: number = 500): WalletResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): WalletResponse {
    return { success: true, message, code: 200, data };
  }


  async createWallet(userId: string, userCode: number): Promise<WalletResponse> {
    try {
      // Get active currencies and separate them efficiently
      const curList = await this.currencyRep.find({ isActive: true }) as CurrencyDocument[];
      if (!curList.count) {
        return this.createErrorResponse("CURRENCY_NOT_FOUND", 404);
      }

      const insert = await this.walletRep.create({
        _id: userId,
        userCode: userCode,
        balances: [...curList?.data?.map((item: any) => {
          return {
            coinId: item._id,
            symbol: item.symbol
          }
        })
        ]
      });
      if (!insert) return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
      return { success: true, message: "SUCCESS", code: 200, data: insert }
    } catch (error) {
      console.error(error, "createWallet");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR");
    }
  }

  async getWalletById(userId: string): Promise<WalletResponse> {
    try {
      let wallet = await this.walletRep.findById(userId);

      if (!wallet) {
        return this.createErrorResponse("WALLET_NOT_FOUND", 404);
      }

      return this.createSuccessResponse(wallet);
    } catch (error) {
      console.error("getWalletByAddress", error);
      return this.createErrorResponse("INTERNAL_SERVER_ERROR");
    }
  }

  async getWalletByUserCode(userCode: number): Promise<WalletResponse> {
    try {
      const wallet = await this.walletRep.findOne({ userCode });
      if (!wallet) {
        return this.createErrorResponse("WALLET_NOT_FOUND", 404);
      }
      return this.createSuccessResponse(wallet);
    } catch (error) {
      console.error("getWalletByUserCode", error);
      return this.createErrorResponse("INTERNAL_SERVER_ERROR");
    }
  }

  async creditAmount(userCode: string, walletType: string, currencyId: string, amount: number): Promise<any> {
    try {

      const wallRedis = await incBalanceRedis(`${walletType}_bal_${currencyId}`, userCode, parseFloat(amount))
      if (!wallRedis) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: wallRedis }
    } catch (error) {
      console.error(error, "creditAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }

  }


  async debitAmount(userCode: string, walletType: string, currencyId: string, amount: number): Promise<any> {
    try {

      const wallRedis = await decBalanceRedis(`${walletType}_bal_${currencyId}`, userCode, amount)
      
      console.log("🚀 ~ WalletService ~ debitAmount ~ wallRedis:", wallRedis)
      if (!wallRedis) {
        return {
          success: false,
          message: "INSUFFICIENT_BALANCE",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: wallRedis }
    } catch (error) {
      console.error(error, "debitAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }

  async redis_to_DB_bal_update(): Promise<any> {
    try {

      // iniitalze strem 
      await redis.balStream()
      let redisCli = await redis.getClient()

      while (true) {
        try {
          const entries = await redisCli.xreadgroup(
            'GROUP',
            BALANCEGROUP,
            BALANCECONSUMER,
            'BLOCK',
            5000,
            'COUNT',
            10,
            'STREAMS',
            BALANCELOG,
            '>'
          );

          if (!entries) continue;

          for (const [, messages] of entries) {
            for (const [id, fields] of messages) {
              const data: Record<string, string> = {};
              for (let i = 0; i < fields.length; i += 2) {
                data[fields[i]] = fields[i + 1];
                }
              try {

                let [walletType, , coinId] = data.wallet.split("_")
                console.log("🚀 ~ WalletService ~ redis_to_DB_bal_update ~ data:", data)

                if (data.action == "increment") {
                  
                  await this.walletRep.updateOne(
                    {
                      userCode: Number(data.user),
                      'balances.coinId': coinId,
                    },
                    {
                      $inc: {
                        [`balances.$.${walletType}`]: parseFloat(data.amount),
                      },
                    }
                  );
                } else if (data.action == "decrement") {
                  await this.walletRep.updateOne(
                    {
                      userCode: Number(data.user),
                      'balances.coinId': coinId,
                    },
                    {
                      $inc: {
                        [`balances.$.${walletType}`]: -parseFloat(data.amount),
                      },
                    }
                  );
                }



                console.log(`✅ Sznced log from Redis ID ${id}`);


                await redisCli.xack(BALANCELOG, BALANCEGROUP, id); // Mark as processed
                await redisCli.xdel(BALANCELOG, id);
                console.log(`✅ Sznced log from Redis ID ${id}`);
              } catch (err) {
                console.error('❌ Failed to insert balance log:', err);
              }
            }
          }
        } catch (err) {
          console.error('❌ Redis stream processing error:', err);
        }

      }
    } catch (error) {
      console.log("🚀 ~ redis_to_DB_bal_update ~ error:", error)

    }
  }


}; 