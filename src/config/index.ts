import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  MONGODB_URI: z.string(),
  REDIS_URI: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN:z.string(),
  BTC_SERVICE_URL: z.string(),
  ETH_SERVICE_URL: z.string(),
  TRX_SERVICE_URL: z.string(),
  BNB_SERVICE_URL: z.string(),
  WEBHOOK_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

export const config = {
  port: parseInt(env.PORT),
  mongodb: {
    uri: env.MONGODB_URI,
  },
  redis: {
    uri: env.REDIS_URI,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  blockchain: {
    btc: {
      nodeUrl: env.BTC_NODE_URL,
    },
    eth: {
      nodeUrl: env.ETH_NODE_URL,
    },
    trx: {
      nodeUrl: env.TRX_NODE_URL,
    },
    bnb: {
      nodeUrl: env.BNB_NODE_URL,
    },
  },
  webhook: {
    secret: env.WEBHOOK_SECRET,
  },
} as const; 