import { Context } from 'hono';
import { WalletService } from '@/services/index';

export class WalletController {

  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  createWallet = async (c: Context) => {
    try {
      // const { userId } = c.get('user');
      // const { userId, userCode } = await c.req.json()
      let userId = "1234567890"  
      let userCode = 123456  

      console.log("🚀 ~ WalletController ~ createWal ~ userId, userCode:", userId, userCode)
      const resp = await this.walletService.createWallet(userCode);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.log("🚀 ~ WalletController ~ createWal ~ error:", error)

      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getWallets = async (c: Context) => {
    try {
      const { userId, userCode } = c.get('user');

      let resp = await this.walletService.getWalletById(userCode);
      if (resp?.success == false && resp?.message == "WALLET_NOT_FOUND") {
        resp = await this.walletService.createWallet(userId, userCode);
      }

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.log("🚀 ~ WalletController ~ getWallets ~ error:", error)
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  creditAmount = async (c: Context) => {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount, walletType } = await c.req.json();
      const resp = await this.walletService.creditAmount(userId, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async debitAmount(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount, walletType } = await c.req.json();
      const resp = await this.walletService.debitAmount(userId, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  ethServiceInitialization = async (c: Context) => {
    try {
      const addresses = await this.walletService.getAllEvmAddresses();
      
      const contractAddresses = await this.walletService.getContractAddresses();
      
      const adminWallet = await this.walletService.getAdminWalletByChain("eth");

      return c.json({
        success: true,
        message: "SUCCESS",
        data: {
          userAddresses: addresses,
          contractAddresses: contractAddresses,
          admin: adminWallet
        }
      });
    } catch (error) {
      console.error('Error in ethServiceInitialization:', error);
      return c.json({
        success: false,
        message: "INTERNAL_SERVER_ERROR",
        data: null
      }, 500);
    }
  }

} 