const { createClient } = require('redis');

const redisClient = createClient({
    url: 'redis://localhost:6379'
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
