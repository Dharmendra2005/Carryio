const Redis = require("ioredis");
const env = require("./env");

let redisClient = null;
let isRedisConnected = false;
const inMemoryCache = new Map();

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        console.warn("[Redis] Server unreachable. Switching to graceful fallback in-memory store.");
        return null; // stop retrying
      }
      return Math.min(times * 100, 2000);
    },
    lazyConnect: true,
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("[Redis] Connected to Redis server successfully.");
  });

  redisClient.on("error", (err) => {
    isRedisConnected = false;
    // Silent catch so it does not crash process on unhandled error
  });

  redisClient.connect().catch((err) => {
    console.warn("[Redis] Connection initial attempt failed:", err.message);
  });
} catch (e) {
  console.warn("[Redis] Failed to initialize Redis client:", e.message);
}

const redisWrapper = {
  async get(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        isRedisConnected = false;
      }
    }
    const item = inMemoryCache.get(key);
    if (item && item.expiry && item.expiry < Date.now()) {
      inMemoryCache.delete(key);
      return null;
    }
    return item ? item.value : null;
  },

  async set(key, value, mode, duration) {
    if (isRedisConnected && redisClient) {
      try {
        if (mode === "EX" && duration) {
          return await redisClient.set(key, value, "EX", duration);
        }
        return await redisClient.set(key, value);
      } catch (err) {
        isRedisConnected = false;
      }
    }
    const expiry = mode === "EX" && duration ? Date.now() + duration * 1000 : null;
    inMemoryCache.set(key, { value, expiry });
    return "OK";
  },

  async del(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.del(key);
      } catch (err) {
        isRedisConnected = false;
      }
    }
    return inMemoryCache.delete(key) ? 1 : 0;
  },

  async keys(pattern) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.keys(pattern);
      } catch (err) {
        isRedisConnected = false;
      }
    }
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const matching = [];
    for (const k of inMemoryCache.keys()) {
      if (regex.test(k)) matching.push(k);
    }
    return matching;
  },

  isConnected() {
    return isRedisConnected;
  },

  getClient() {
    return redisClient;
  }
};

module.exports = redisWrapper;
