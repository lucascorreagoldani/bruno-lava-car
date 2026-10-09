import { Redis } from "ioredis";
import { env } from "../../config/env.js";

let redisClientInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClientInstance) {
    redisClientInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy(times) {
        return Math.min(times * 100, 3000);
      }
    });
  }

  return redisClientInstance;
}

export const redis = getRedisClient();
