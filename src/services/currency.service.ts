import { getRepository } from "@/models/repositoryFactory";
import { CurrencyModel } from "@/models/schemas/index";


export class CurrencyService {
  private currencyRep = getRepository(CurrencyModel);


  async addCurrency(data: any): Promise<any> {
    try {
      const walletRec = await this.currencyRep.exists({ symbol: data.symbol });
      if (walletRec) {
        return {
          success: false,
          message: "COIN_ALREADY_EXIST",
          code: 404,
          data: ""
        }
      }
      const newWallet = await this.currencyRep.create(data);
      return { success: true, message: "SUCCESS", code: 200, data: walletRec };
    } catch (error) {
      console.error("addCurrency", error)
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

  async updateCurrency(_id: string, updateDoc: any,): Promise<any> {
    try {
      const walletRec = await this.currencyRep.findById(_id);
      if (!walletRec) {
        return {
          success: false,
          message: "COIN_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      const updateRecord = await this.currencyRep.updateOne({ _id: _id }, { $set: updateDoc });
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
      console.error(error, "updateCurrency");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }

  }

  async getAllCurrency(filter = {}, options = {}): Promise<any> {
    try {

      const currencyDoc = await this.currencyRep.find(filter, options);
      if (!currencyDoc) {
        return {
          success: false,
          message: "COIN_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: currencyDoc };
    } catch (error) {
      console.error(error, "getAllCurrency");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }

  async getActiveCurrency(): Promise<any> {
    try {
      const currencyDoc = await this.currencyRep.find({ isActive: true });
      if (!currencyDoc) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }

      return { success: true, message: "SUCCESS", code: 200, data: currencyDoc };
    } catch (error) {
      console.error(error, "getAllCurrency");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }
  async getCurrencyByName(currencyName: string): Promise<any> {
    try {

      const walletRec = await this.currencyRep.findOne({ symbol: currencyName });
      if (!walletRec) {
        return {
          success: false,
          message: "CURRENCY_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: walletRec };
    } catch (error) {
      console.error(error, "getCurrencyByName");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }


  async getCurrencyById(userId: string): Promise<any> {
    try {

      const walletRec = await this.currencyRep.findById(userId);
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
      console.error(error, "getCurrencyById");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }

  async getAllCurrencyIds(): Promise<any> {
    try {

      const walletRec = await this.currencyRep.distinct('_id', { isActive: true });
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
      console.error(error, "getCurrencyById");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }

}; 