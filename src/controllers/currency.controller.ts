import { Context } from 'hono';
import { CurrencyService } from '@/services/index';
import { ValidationController } from "@/controllers/index";


const currencyService = new CurrencyService();


export class CurrencyController {
  getAllCurrency = async (c: Context) => {
    try {

      const { type, page, limit, crypto, fiat, userId } = await c.req.query();

      let filter: any = {}
      if (type) filter = { ...filter, side: type == 'buy' ? 1 : type == 'sell' ? 0 : 0 }
      if (crypto) filter = { ...filter, firstCoin: crypto }
      if (fiat) filter = { ...filter, secondCoin: fiat }
      if (userId) filter = { ...filter, userId: { $ne: userId } }

      let options = { skip: Number(page ?? 0) * Number(limit ?? 0), limit: Number(limit ?? 20) }
      const resp = await currencyService.getAllCurrency(filter, options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async addCurrency(c: Context) {
    try {
      const { symbol, name, type, isActive, network } = await c.req.json();

      // 1. map your incoming body to ValidationInput[]
      const validationPayload = [
        { field: "symbol", type: "string", value: symbol },
        { field: "name", type: "string", value: name },
        { field: "type", type: "string", value: type },
        { field: "isActive", type: "boolean", value: isActive },
      ];

      // 2. run your controller
      const { errors } = ValidationController.validate(validationPayload);

      // 3. if any, return early
      if (Object.keys(errors).length > 0)
        return c.json(
          { success: false, errors, message: "VALIDATION_ERROR" },
          400,
        );

      const resp = await currencyService.addCurrency({ symbol, name, type, isActive, network });
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.error("🚀 ~ CurrencyController ~ addCurrency ~ error:", error)
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async updateCurrency(c: Context) {
    try {
      const { symbol, name, type, isActive, network } = await c.req.json();
      const { id } = await c.req.param();

      // 1. map your incoming body to ValidationInput[]
      const validationPayload = [
        { field: "symbol", type: "string", value: symbol },
        { field: "name", type: "string", value: name },
        { field: "type", type: "string", value: type },
        // { field: "isActive", type: "boolean", value: isActive },
      ];

      // 2. run your controller
      const { errors } = ValidationController.validate(validationPayload);

      // 3. if any, return early
      if (Object.keys(errors).length > 0)
        return c.json(
          { success: false, errors, message: "VALIDATION_ERROR" },
          400,
        );

      const resp = await currencyService.updateCurrency(id, { symbol, name, type, isActive, network });
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getActiveCurrency = async (c: Context) => {
    try {
      const resp = await currencyService.getActiveCurrency();
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async getCurrencyByName(c: Context) {
    try {
      const { currencyName } = await c.req.json();
      const resp = await currencyService.getCurrencyByName(currencyName);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }
  async getCurrencyById(c: Context) {
    try {
      const { id: currencyId } = await c.req.param();
      const resp = await currencyService.getCurrencyById(currencyId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.error("🚀 ~ CurrencyController ~ getCurrencyById ~ error:", error)
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

} 