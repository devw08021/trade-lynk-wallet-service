import { Context } from 'hono';
import { CurrencyService } from '@/services/index';

import { ApiError } from "@/utils/error";


export class WalletController {
  constructor(private currencyService: CurrencyService) { }

  async addCurrency(c: Context) {
    try {
      const { userId } = c.get('user');
      const resp = await this.currencyService.addCurrency(userId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      throw new ApiError(error, 500);
    }
  }

  async updateCurrency(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount } = await c.req.json();
      const resp = await this.currencyService.updateCurrency(userId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

  async getAllCurrency(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount } = await c.req.json();
      const resp = await this.currencyService.getAllCurrency(userId, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

  async getCurrencyByName(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyName } = await c.req.json();
      const resp = await this.currencyService.getCurrencyByName(userId, currencyName);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }
  async getCurrencyById(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId } = await c.req.json();
      const resp = await this.currencyService.getCurrencyById(userId, currencyId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

} 