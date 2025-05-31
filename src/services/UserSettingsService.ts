import { UserSettingModel } from "@/models/schema/index";
import { getRepository } from "@/models/repositoryFactory";

import { UserSettingsInterface, UserSettingsInterface } from "@/interfaces/user"; // Adjust path as 

//import error handling
import { ApiError } from "../utils/error";

export class UserSettingsService {
  private userSettingRep = getRepository(UserSettingModel);

  async getUserSettings(userId: string): Promise<UserSettingsInterface> {
    const user = await this.userSettingRep.findById(userId);
    if (!user) {
      throw new ApiError(400, {
        code: 'USER_NOT_FOUND',
        message: 'USER_NOT_FOUND',
      });
    }
    return user;
  }

  async updateUserSettings(
    userId: string,
    updateData: Partial<UserSettingsInterface>
  ): Promise<UserSettingsInterface> {
    const {
      ...safeUpdateData
    } = updateData;

    const result = await this.userSettingRep.updateOrInset(userId, {
      ...safeUpdateData,
      updatedAt: new Date(),
    });

    if (!result) {
      throw new ApiError(400, {
        code: 'USER_SETTINGS_UPDATE_FAILED',
        message: 'USER_SETTINGS_UPDATE_FAILED',
      })
    }

    return { result: result };
  }

}