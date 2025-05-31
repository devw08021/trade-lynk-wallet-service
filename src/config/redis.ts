import { createClient } from 'redis';
import { config } from './index';

let client: ReturnType<typeof createClient>;

export async function connectRedis() {
  if (!client) {
    client = createClient({
      url: config.redis.uri,
    });

    client.on('error', (err) => console.error('Redis Client Error:', err));
    await client.connect();
  }
  return client;
}

export async function closeRedis() {
  if (client) {
    await client.quit();
  }
} 