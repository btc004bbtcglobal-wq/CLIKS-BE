const { getRedis } = require('./redisClient');
const logger = require('./logger');
const { scanKeys } = require('./redisScan');

/**
 * Generate a consistent cache key
 */
const generateCacheKey = (req) => {
  const userId = req.user ? req.user.id : 'global';
  const pathPart = (req.baseUrl + req.path).replace(/\/$/, "");

  // Restrict query metrics to mitigate Cache Explosion
  const allowedQueryKeys = ["page", "limit", "type", "account_id", "category", "from", "to", "sort", "order", "search"];
  
  const filteredQuery = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (allowedQueryKeys.includes(key)) {
      filteredQuery[key] = value;
    }
  }

  // Sort parameters to prevent key variation for out-of-order queries
  const queryPart = Object.keys(filteredQuery).length 
    ? ':' + new URLSearchParams(Object.keys(filteredQuery).sort().reduce((acc, currentKey) => {
        acc[currentKey] = filteredQuery[currentKey];
        return acc;
      }, {})).toString()
    : '';

  return `cache:${pathPart}:user:${userId}${queryPart}`;
};

/**
 * Executes a redis promise with a strict timeout
 * @param {Promise} promise 
 * @param {number} ms 
 */
const withTimeout = (promise, ms = 100) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('REDIS_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

/**
 * Invalidates cache entries matching a pattern
 */
const invalidateCache = async (pattern) => {
  const redisClient = getRedis();
  if (!redisClient) return;

  try {
    const keys = await withTimeout(scanKeys(pattern), 500);
    if (keys && keys.length > 0) {
      await withTimeout(redisClient.del(keys), 200);
      logger.debug(`[CACHE INVAL] Deleted ${keys.length} keys for pattern: ${pattern}`);
    }
  } catch (err) {
    if (err.message === 'REDIS_TIMEOUT') {
      logger.warn(`[CACHE INVAL] Timeout while invalidating pattern: ${pattern}`);
    } else {
      logger.error(`[CACHE INVAL] Failed to invalidate pattern ${pattern}: ${err.message}`);
    }
  }
};

/**
 * Invalidate user's home dashboard
 */
const invalidateUserDashboard = async (userId) => {
  if (!userId) return;
  // Clear `/api/v1/home` and `/api/v1/home/summary`
  await invalidateCache(`cache:*/home*:user:${userId}*`);
};

/**
 * Invalidate public feeds
 */
const invalidatePublicFeed = async () => {
  await invalidateCache(`cache:*/public*:user:*`);
};

module.exports = {
  generateCacheKey,
  withTimeout,
  invalidateCache,
  invalidateUserDashboard,
  invalidatePublicFeed
};
