const { createClient } = require('redis');
require('dotenv').config();  // Load environment variables

// Use environment variables to configure Redis
const isDocker = process.env.NODE_ENV === 'docker';

// Determine the Redis host dynamically
const REDIS_HOST = isDocker ? process.env.REDIS_HOST : process.env.LOCAL_REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = redisClient;
