import { Context } from 'hono';
import { WalletService } from '@/services/index';

import { ApiError } from '@/utils/error';

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  async createWallet(c: Context) {
    try {
      // const { userId } = c.get('user');
      const { userId, userCode } = await c.req.json()
      const resp = await this.walletService.createWallet(userId, userCode);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      throw new ApiError(500, error);
    }
  }

  async getWallets(c: Context) {
    try {
      const { userId } = c.get('user');
      const resp = await this.walletService.getWalletById(userId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

  async creditAmount(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount } = await c.req.json();
      const resp = await this.walletService.creditAmount(userId, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

  async debitAmount(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount } = await c.req.json();
      const resp = await this.walletService.creditAmount(userId, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

} 