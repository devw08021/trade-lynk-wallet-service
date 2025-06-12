import { getRepository } from "@/models/repositoryFactory";
import { WalletModel, CurrencyModel } from "@/models/schemas/index";

import { incBalanceRedis, decBalanceRedis, redis } from '@/config/redis'

const BALANCELOG = 'balance_logs';
const BALANCEGROUP = 'balance_group';
const BALANCECONSUMER = 'balance_sync_worker'

export class WalletService {
  private walletRep = getRepository(WalletModel);
  private currencyRep = getRepository(CurrencyModel);

  async createWallet(userId: string, userCode: number): Promise<any> {
    console.log("🚀 ~ WalletService ~ createWallet ~ userIdssd:", userId,userCode)
    try {
      const walletRec = await this.walletRep.exists({ _id: userId });

      if (walletRec) {
        return {
          success: false,
          message: "WALLET_ALREADY_EXISTS",
          code: 404,
          data: ""
        }
      }

      const curList = await this.currencyRep.find({ isActive: true })
      if (curList?.count == 0) return { success: false, message: "CURRENCY_NOT_FOUND", code: 404, data: "" }
      console.log("🚀 ~ WalletService ~ createWallet ~ curList:", curList)
      // Create wallet for EVM servers
      const insert = await this.walletRep.create({
        _id: userId,
        userCode: userCode,
        assets: [...curList?.data?.map((item) => {
          return {
            currencyId: item._id,
            symbol: item.symbol,
          }
        })
        ]
      })
      if (!insert) return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
      return { success: true, message: "SUCCESS", code: 200, data: insert }
    }
    catch (error) {
      console.error(error, "createWallet");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

  async getWalletById(userCode: string): Promise<any> {
    try {
      const walletRec = await this.walletRep.findOne({ userCode });
      if (!walletRec) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: walletRec };
    } catch (error) {
      console.error("getWalletById", userId, error)
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

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

      const wallRedis = await decBalanceRedis(`${walletType}_bal_${currencyId}`, userCode, parseFloat(amount))
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
              console.log("🚀 ~ WalletService ~ redis_to_DB_bal_update ~ data:", data)
              try {

                let [walletType, , symbol] = data.wallet.split("_")

                if (data.action == "increment") {
                  await this.walletRep.updateOne(
                    {
                      userCode: data.user,
                      'assets.symbol': symbol,
                    },
                    {
                      $inc: {
                        [`assets.$.${walletType}`]: data.amount,
                      },
                    }
                  );
                } else if (data.action == "decrement") {
                  await this.walletRep.updateOne(
                    {
                      userCode: data.user,
                      'assets.symbol': symbol,
                    },
                    {
                      $inc: {
                        [`assets.$.${walletType}`]: -data.amount,
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