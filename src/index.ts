import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { config } from './config';
import { walletRoutes } from './routes/index';


import { ApiError } from './utils/error';

import { connect } from "./config/database";
import { connectRedis, getRedisClient, closeRedis } from "./config/redis";

import { startDepositConsumer, getKafkaStatus } from './services/kafka.service';

let app: Hono;


const shutdown = async () => {
  console.log("Shutting down...");
  try {
    await closeRedis();
    console.log("All connections closed");
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Initialize connections
const init = async () => {
  try {
    await connect();

    // 2. Connect to Redis
    await connectRedis();

    // 3. Redis Subscriber Setup (Optional)
    // const redisClient = getRedisClient(); // Now safe
    // const subscriber = redisClient.duplicate();


    // await subscriber.subscribe("user-events", (message) => {
    //   console.log("Received user event:", message);
    // });


    // 4. Only now initialize Hono app
    app = new Hono();


    app.use("*", logger());
    app.use("*", cors());
    app.use('*', prettyJSON());

    // 1) set up error handler
    app.onError((err, c) => {
      if (err instanceof ApiError) {
        return c.json({ success: false, errors: err.info }, err.status);
      }
      if (process.env.NODE_ENV !== 'production') console.error(err);
      return c.json(
        {
          success: false,
          errors: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal Server Error',
          },
        },
        500
      );
    });

    // Routes
    app.route('/api/v1/wallets', walletRoutes);
    // app.route('/api/v1/transactions', transactionRoutes);
    // app.route('/api/v1/webhooks', webhookRoutes);

    // Health check
    app.get('/health', (c) => c.json({ status: 'ok' }));

    // Kafka status/debug endpoint
    app.get('/kafka-status', (c) => c.json(getKafkaStatus()));


    await startDepositConsumer();

    // not found handler
    app.notFound((c) => {
      return c.json({ success: false, message: "Not Found" }, 404);
    });

  } catch (error) {
    console.error('Failed to initialize connections:', error);
    process.exit(1);
  }
};

// Start server
const port = config.port || 3001;
console.log(`Server is running on port ${port}`);


export default {
  port: config.port,
  fetch: (req: Request, env: unknown, ctx: ExecutionContext) =>
    app.fetch(req, env, ctx),
};

// Initialize and start
init(); 