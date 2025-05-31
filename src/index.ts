import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { config } from './config';
import { walletRoutes } from './routes/wallet.routes';
// import { transactionRoutes } from './routes/transaction.routes';
// import { webhookRoutes } from './routes/webhook.routes';
import { errorHandler } from './middleware/error.middleware';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { startDepositConsumer, getKafkaStatus } from './services/kafka.service';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors());
app.use('*', errorHandler);

// Routes
app.route('/api/v1/wallets', walletRoutes);
// app.route('/api/v1/transactions', transactionRoutes);
// app.route('/api/v1/webhooks', webhookRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Kafka status/debug endpoint
app.get('/kafka-status', (c) => c.json(getKafkaStatus()));

// Initialize connections
const init = async () => {
  try {
    await connectDB();
    await connectRedis();
    await startDepositConsumer();
    console.log('Connected to MongoDB and Redis');
  } catch (error) {
    console.error('Failed to initialize connections:', error);
    process.exit(1);
  }
};

// Start server
const port = config.PORT || 3001;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};

// Initialize and start
init(); 