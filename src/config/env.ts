export const env = {
  PORT: parseInt(process.env.PORT || '3017'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://trade-lynk:fvZS2mrmdRaWZMUZ@trade-lynk.xusv8ii.mongodb.net/trade-lynk?retryWrites=true&w=majority&appName=trade-lynk',
  REDIS_URL: process.env.REDIS_URL || 'rediss://default:AautAAIjcDExYjhiNjg1NjU0NDA0YjMxYWVhMDA0ZTUxOGRmNDk3NXAxMA@in-robin-43949.upstash.io:6379',
  // MONGODB_URI: "mongodb://localhost:27017/trade-lynk",
  // REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
}; 