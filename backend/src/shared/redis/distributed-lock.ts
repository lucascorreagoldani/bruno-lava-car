import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import { redis } from "./redis-client.js";
import { ConflictError } from "../errors/conflict-error.js";

const RELEASE_LOCK_LUA_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export class DistributedLock {
  constructor(private readonly client: Redis = redis) { }

  async acquire(resourceKey: string, ttlMs = 5000): Promise<string | null> {
    const token = randomUUID();
    const result = await this.client.set(resourceKey, token, "PX", ttlMs, "NX");

    if (result === "OK") {
      return token;
    }

    return null;
  }

  async release(resourceKey: string, token: string): Promise<boolean> {
    const result = await this.client.eval(
      RELEASE_LOCK_LUA_SCRIPT,
      1,
      resourceKey,
      token
    );

    return result === 1;
  }

  async withLock<T>(
    resourceKey: string,
    ttlMs: number,
    operation: () => Promise<T>
  ): Promise<T> {
    const token = await this.acquire(resourceKey, ttlMs);

    if (!token) {
      throw new ConflictError(
        "O recurso solicitado está temporariamente bloqueado por outra reserva concorrente. Tente novamente em alguns segundos."
      );
    }

    try {
      return await operation();
    } finally {
      await this.release(resourceKey, token);
    }
  }
}

export const distributedLock = new DistributedLock();
