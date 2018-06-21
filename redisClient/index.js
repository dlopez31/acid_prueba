const redis= require('redis');
const redisClient=redis.createClient({host:"redis_server"})
const {promisify} = require('util');
const getAsync = promisify(redisClient.get).bind(redisClient);

module.exports = {
  redis,
  redisClient
};
