import IORedis, { Redis } from "ioredis";
import { config } from "./index";

class RedisClient {
  private static instance: RedisClient;
  private client: Redis | null = null;
  private isConnected = false;

  private constructor() { }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected && this.client) return;

    this.client = new IORedis(config.redis.uri, {
      maxRetriesPerRequest: 10,
      retryStrategy: (times) => Math.min(times * 50, 2000)

    });

    await new Promise<void>((resolve, reject) => {
      this.client!.once("ready", () => {
        this.isConnected = true;
        console.log("Connected to Redis");
        resolve();
      });

      this.client!.once("error", (err) => {
        console.error("Redis connection error:", err);
        this.isConnected = false;
        reject(err);
      });
    });

    this.client.on("close", () => {
      this.isConnected = false;
      console.log("Redis connection closed");
    });
  }

  public getClient(): Redis {
    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected. Call connect() first.");
    }
    return this.client;
  }

  public async close(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log("Redis connection closed");
    }
  }

  public async publish(channel: string, message: string): Promise<number> {
    const client = this.getClient();
    return await client.publish(channel, message);
  }

  public async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    const client = this.getClient();
    await client.subscribe(channel);
    client.on("message", (ch, msg) => {
      if (ch === channel) {
        callback(msg);
      }
    });
  }


  // notmal redis commands
  public async set(key: string, value: string, ttlInSeconds?: number): Promise<"OK" | null> {
    try {
      const client = this.getClient();
      if (ttlInSeconds) {
        return await client.set(key, value, "EX", ttlInSeconds);
      }
      return await client.set(key, value);
    } catch (err) {
      console.error("Redis SET error:", err);
      return null;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      const client = this.getClient();
      return await client.get(key);
    } catch (err) {
      console.error("Redis GET error:", err);
      return null;
    }
  }

  public async hset(hash: string, field: string, value: string): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.hset(hash, field, value);
    } catch (err) {
      console.error("Redis HSET error:", err);
      return null;
    }
  }

  public async hget(hash: string, field: string): Promise<string | null> {
    try {
      const client = this.getClient();
      return await client.hget(hash, field);
    } catch (err) {
      console.error("Redis HGET error:", err);
      return null;
    }
  }

  public async del(key: string): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.del(key);
    } catch (err) {
      console.error("Redis DEL error:", err);
      return null;
    }
  }

  public async exists(key: string): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.exists(key);
    } catch (err) {
      console.error("Redis EXISTS error:", err);
      return null;
    }
  }

  public async expire(key: string, seconds: number): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.expire(key, seconds);
    } catch (err) {
      console.error("Redis EXPIRE error:", err);
      return null;
    }
  }

  public async zadd(key: string, score: number, member: string): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.zadd(key, score, member);
    } catch (err) {
      console.error("Redis ZADD error:", err);
      return null;
    }
  }

  public async lpush(key: string, ...values: string[]): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.lpush(key, ...values);
    } catch (err) {
      console.error("Redis LPUSH error:", err);
      return null;
    }
  }

  public async rpush(key: string, ...values: string[]): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.rpush(key, ...values);
    } catch (err) {
      console.error("Redis RPUSH error:", err);
      return null;
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<string[] | null> {
    try {
      const client = this.getClient();
      return await client.lrange(key, start, stop);
    } catch (err) {
      console.error("Redis LRANGE error:", err);
      return null;
    }
  }

  public async zrange(key: string, start: number, stop: number): Promise<string[] | null> {
    try {
      const client = this.getClient();
      return await client.zrange(key, start, stop);
    } catch (err) {
      console.error("Redis ZRANGE error:", err);
      return null;
    }
  }

  public async zrem(key: string, ...members: string[]): Promise<number | null> {
    try {
      const client = this.getClient();
      return await client.zrem(key, ...members);
    } catch (err) {
      console.error("Redis ZREM error:", err);
      return null;
    }
  }

  /**
   * Atomic increment by Lua script
   */
  public async incNumber(key: string, increment: number): Promise<number | null> {
    const script = `
      local val = redis.call('INCRBY', KEYS[1], tonumber(ARGV[1]))
      return val
    `;
    try {
      const client = this.getClient();
      const result = await client.eval(script, 1, key, increment);
      return typeof result === 'number' ? result : Number(result);
    } catch (err) {
      console.error("Redis incrByLua error:", err);
      return null;
    }
  }

  /**
   * Atomic decrement by Lua script
   */
  public async decNumber(key: string, decrement: number): Promise<number | null> {
    const script = `
      local val = redis.call('DECRBY', KEYS[1], tonumber(ARGV[1]))
      return val
    `;
    try {
      const client = this.getClient();
      const result = await client.eval(script, 1, key, decrement);
      return typeof result === 'number' ? result : Number(result);
    } catch (err) {
      console.error("Redis decrByLua error:", err);
      return null;
    }
  }
}

export const redis = RedisClient.getInstance();
export const connectRedis = async (): Promise<void> => await redis.connect();
export const getRedisClient = (): Redis => redis.getClient();
export const closeRedis = async (): Promise<void> => await redis.close();

export const set = redis.set.bind(redis);
export const get = redis.get.bind(redis);
export const hget = redis.hget.bind(redis);
export const del = redis.del.bind(redis);
export const exists = redis.exists.bind(redis);
export const expire = redis.expire.bind(redis);
export const zadd = redis.zadd.bind(redis);
export const lpush = redis.lpush.bind(redis);
export const rpush = redis.rpush.bind(redis);
export const lrange = redis.lrange.bind(redis);
export const zrange = redis.zrange.bind(redis);
export const zrem = redis.zrem.bind(redis);
export const incNumber = redis.incNumber.bind(redis);
export const decNumber = redis.decNumber.bind(redis);

