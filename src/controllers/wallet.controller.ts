import { Context } from 'hono';
import { WalletService } from '@/services/index';

import { ApiError } from '@/utils/error';


const walletService = new WalletService();

export class WalletController {


  createWallet = async (c: Context) => {
    try {
      // const { userId } = c.get('user');
      const { userId, userCode } = await c.req.json()

      console.log("🚀 ~ WalletController ~ createWal ~ userId, userCode:", userId, userCode)
      const resp = await walletService.createWallet(userId, userCode);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.log("🚀 ~ WalletController ~ createWal ~ error:", error)

      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getWallets = async (c: Context) => {
    try {
      const { userId, userCode } = c.get('user');

      let resp = await walletService.getWalletById(userCode);
      if (resp?.success == false && resp?.message == "WALLET_NOT_FOUND") {
        resp = await walletService.createWallet(userId, userCode);
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
      const resp = await walletService.creditAmount(userId, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async debitAmount(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount, walletType } = await c.req.json();
      const resp = await walletService.debitAmount(userId, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

} 