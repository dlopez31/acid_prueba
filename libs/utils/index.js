import request from 'request';
import env from '../config';
import redisObject from '../redisClient';

const { redisClient } = redisObject;

const makeUrl = (fn, currency) => {
  return `${env.API_URL}?function=${fn}&symbol=${currency}&market=CLP&apikey=${env.API_KEY}`;
}

const checkParams = (req, res, next) => {
  const {
    currency
  } = req.query;

  if (typeof currency === 'undefined' || currency === null || currency === '') {
    return res.status(400)
      .send({
        success: false,
        error: 'Error debe especificar a currency',
      });
  }
  next();
};

const simulateErrorNetwork = (cb) => {
  const randomNumber = Math.round(Math.random() * 100);
  console.log("random", randomNumber)
  if (randomNumber <= 10) {
    console.log('retry request', new Error('How Unfortunate the API Request Failed!!!'));
    return simulateErrorNetwork(cb);
  }
  cb();
};

const getCurrency = (url, cb) => {
  simulateErrorNetwork(request.bind(null, url, cb));
};

const getCurrenyOnRedis = (req, res, next) => {
  simulateErrorNetwork(serarchOnRedis.bind(null, req, res, next));
};

const serarchOnRedis = (req, res, next) => {
  let {
    currency
  } = req.query;

  if (req.path === '/monthly') {
    currency = `${currency}M`;
  }

  redisClient.get(currency, (error, value) => {
    if (error || value === null) {
      console.log("buscar en api");
      return next();
    }
    console.log("buscado en redis");
    try {
      const json = JSON.parse(value);
      res.json(json);
    } catch (er) {
      return res.status(400)
        .send({
          success: false,
          error: err.message || err
        });
    }
  })
};

export default {
  makeUrl,
  checkParams,
  getCurrency,
  getCurrenyOnRedis,
  redisClient
};
