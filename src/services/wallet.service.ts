import { getRepository } from "@/models/repositoryFactory";
import { WalletModel, CurrencyModel } from "@/models/schemas/index";


export class WalletService {
  private walletRep = getRepository(WalletModel);
  private currencyRep = getRepository(CurrencyModel);

  async createWallet(userId: string, userCode: number): Promise<any> {
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
      // Create wallet for EVM servers
      const insert = await this.walletRep.create({
        _id: userId,
        userCode: userCode,
        assets: [...curList?.data?.map((item) => {
          return {
            currencyId: item._id,
            network: {
              symbol: item.symbol,
            }
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

  async getWalletById(userId: string): Promise<any> {
    try {
      const walletRec = await this.walletRep.findById(userId);
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

  async creditAmount(userId: string, currencyId: string, amount: number): Promise<any> {
    try {
      const walletRec = await this.walletRep.findById(userId);
      if (!walletRec) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      const updateRecord = await this.walletRep.updateOne({ _id: userId }, { $inc: { [currencyId]: amount } });
      if (!updateRecord) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: walletRec }
    } catch (error) {
      console.error(error, "creditAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }

  }

  async debitAmount(userId: string, currencyId: string, amount: number): Promise<any> {
    try {

      const walletRec = await this.walletRep.findById(userId);
      if (!walletRec) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      if (walletRec[currencyId] < amount) {
        return {
          success: false,
          message: "INSUFFICIENT_BALANCE",
          code: 404,
          data: ""
        }
      }
      const updateRecord = await this.walletRep.updateOne({ _id: userId }, { $inc: { [currencyId]: -amount } });
      if (!updateRecord) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
    } catch (error) {
      console.error(error, "debitAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }

}; 