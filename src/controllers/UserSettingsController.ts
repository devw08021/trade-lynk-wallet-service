// src/controllers/AuthController.ts
import { Context } from "hono";
// controllers/
import { ValidationController } from "./index";
// services
import { UserSettingsService } from "../services/index";
// units
import { ApiError } from "../utils/error";

const userSettingsService = new UserSettingsService();

export class UserSettingsController {
  async getCurrentUserSettings(c: Context) {
    try {
      const { id, email, role } = c.get("user");
      const userSettingDoc = await userSettingsService.getUserSettings(id);
      return c.json({ success: true, result: userSettingDoc }, 200);
    } catch (err) {
      throw err;
    }
  }
  async updateUserSettings(c: Context) {
    try {
      const { id, email, role } = c.get("user");

      const { theme, language, timezone, currency,
        siteNotifications, emailNotifications
      } = await c.req.json();

      const valBody = [];
      if (theme) valBody.push({ field: "theme", type: "string", value: theme },)
      if (language) valBody.push({ field: "language", type: "string", value: language },)
      if (timezone) valBody.push({ field: "timezone", type: "string", value: timezone },)
      if (currency) valBody.push({ field: "currency", type: "string", value: currency },)
      if (siteNotifications) valBody.push({ field: "siteNotifications", type: "boolean", value: siteNotifications },)
      if (emailNotifications) valBody.push({ field: "emailNotifications", type: "boolean", value: emailNotifications },)

      const { errors } = ValidationController.validate(valBody);
      if (Object.keys(errors).length > 0) {
        return c.json({ success: false, errors }, 400);
      }

      // 4. no errors → go ahead and register
      const result = await userSettingsService.updateUserSettings(id, {
        _id: id,
        theme, language, timezone, currency,
        siteNotifications, emailNotifications
      });

      return c.json({ success: true, ...result }, 201);
    } catch (err) {
      throw err
    }
  }


}
