// src/dal/repositories/repositoryFactory.ts
import { BaseRepository } from "./baseRepository";

// Define a generic repository accessor
export function getRepository<T>(model: Model<T>): BaseRepository<T> {
  return new BaseRepository<T>(model);
}
