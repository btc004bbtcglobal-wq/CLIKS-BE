const { getRedis } = require('./redisClient');

/**
 * Uses Redis SCAN to iterate over keys safely, without blocking.
 * @param {string} pattern
 * @returns {Promise<string[]>}
 */
const scanKeys = async (pattern) => {
  const redisClient = getRedis();
  if (!redisClient) return [];

  let cursor = 0;
  const matchingKeys = new Set();
  
  do {
    const res = await redisClient.scan(cursor, {
      MATCH: pattern,
      COUNT: 100
    });
    
    // Some older versions of redis client return [cursor, keys] array.
    // Node-Redis v4 returns { cursor, keys }
    // We handle the node redis v4 structure here.
    cursor = res.cursor;
    for (const key of res.keys) {
      matchingKeys.add(key);
    }
  } while (cursor !== 0);

  return Array.from(matchingKeys);
};

module.exports = { scanKeys };
