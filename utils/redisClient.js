const redis = require('redis');
const logger = require('./logger');

let client = null;

if (process.env.REDIS_ENABLED === 'true') {
  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  });

  client.on('error', (err) => logger.error(`Redis Client Error: ${err.message}`));
  client.on('connect', () => logger.info('Redis connected'));

  // Connect asynchronously (Redis v4+)
  client.connect().catch(err => {
    logger.warn(`Failed to connect to Redis. Caching is disabled. Error: ${err.message}`);
    client = null;
  });
} else {
  logger.info('Redis disabled or unavailable, skipping cache');
}

module.exports = {
  getRedis: () => client
};
