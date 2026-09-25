const redis = require("../config/redis");

const getCache = async (key) => {
  try {
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (err) {
    console.error("[Redis Cache] Error reading cache:", err.message);
    return null;
  }
};

const setCache = async (key, data, ttlSeconds = 300) => {
  try {
    const stringified = JSON.stringify(data);
    await redis.set(key, stringified, "EX", ttlSeconds);
  } catch (err) {
    console.error("[Redis Cache] Error writing cache:", err.message);
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("[Redis Cache] Error deleting key:", err.message);
  }
};

const clearCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      for (const k of keys) {
        await redis.del(k);
      }
    }
  } catch (err) {
    console.error("[Redis Cache] Error clearing pattern:", err.message);
  }
};

const cacheMiddleware = (keyPrefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
  cacheMiddleware,
};
