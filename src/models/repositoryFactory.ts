// src/dal/repositories/repositoryFactory.ts
import { BaseRepository } from "./baseRepository";
import UserModel from "@/models/schema/user";

// Type-safe model registry
const models = {
  user: UserModel,
};
// Define a generic repository accessor
export function getRepository<T>(model: Model<T>): BaseRepository<T> {
  return new BaseRepository<T>(model);
}
