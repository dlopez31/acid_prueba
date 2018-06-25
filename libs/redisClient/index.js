import  redis from 'redis';
const redisClient = redis.createClient({host:"redis_server"});

module.exports = {
  redis,
  redisClient
};
