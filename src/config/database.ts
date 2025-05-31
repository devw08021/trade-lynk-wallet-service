import mongoose from 'mongoose';
import { config } from './index';

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongodb.uri);
  }
  return mongoose;
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
