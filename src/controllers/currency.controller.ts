import { Context } from 'hono';
import { CurrencyService } from '@/services/index';

import { ApiError } from "@/utils/error";

const currencyService = new CurrencyService();


export class CurrencyController {

  async addCurrency(c: Context) {
    try {
      const { userId } = c.get('user');
      const resp = await currencyService.addCurrency(userId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async updateCurrency(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId, amount } = await c.req.json();
      const resp = await currencyService.updateCurrency(userId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getAllCurrency = async (c: Context) => {
    try {
      const resp = await currencyService.getActiveCurrency();
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async getCurrencyByName(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyName } = await c.req.json();
      const resp = await currencyService.getCurrencyByName(userId, currencyName);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }
  async getCurrencyById(c: Context) {
    try {
      const { userId } = c.get('user');
      const { currencyId } = await c.req.json();
      const resp = await currencyService.getCurrencyById(userId, currencyId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

} 