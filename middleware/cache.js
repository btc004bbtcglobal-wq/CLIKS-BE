const { getRedis } = require('../utils/redisClient');
const logger = require('../utils/logger');

/**
 * Middleware to cache responses using Redis.
 * Caching is automatically bypassed if Redis is disabled or fails.
 * Only caches 200 responses.
 * @param {number} ttlSeconds Time-to-live in seconds
 */
const cache = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const redisClient = getRedis();
    
    // If Redis is not available, proceed without caching
    if (!redisClient) {
      logger.debug('Cache SKIPPED (Redis disabled)');
      return next();
    }

    const { generateCacheKey, withTimeout } = require('../utils/cacheInvalidation');
    const key = generateCacheKey(req);

    try {
      const cachedData = await withTimeout(redisClient.get(key), 100);
      if (cachedData) {
        logger.debug(`Cache HIT: ${key}`);
        return res.json(JSON.parse(cachedData));
      }
      logger.debug(`Cache MISS: ${key}`);

      // Intercept res.json to cache the outgoing response body
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200) {
          logger.debug(`Cache SET: ${key} (ttl=${ttlSeconds})`);
          withTimeout(redisClient.setEx(key, ttlSeconds, JSON.stringify(body)), 100).catch((err) => {
            if (err.message !== 'REDIS_TIMEOUT') {
              logger.error(`Redis cache write error: ${err.message}`);
            }
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      if (err.message === 'REDIS_TIMEOUT') {
        logger.warn(`Cache SKIP (Timeout reading key: ${key})`);
      } else {
        logger.error(`Redis cache read error (falling back to standard route): ${err.message}`);
      }
      next(); // fallback to standard route handling if Redis drops dynamically
    }
  };
};

module.exports = cache;
