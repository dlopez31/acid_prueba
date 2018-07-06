import request from 'request';
import env from '../config';
import redisObject from '../redisClient';
import message from './message';

const { redisClient } = redisObject;
const { sendError } = message;


const makeUrl = (fn, currency) => {
  return `${env.API_URL}?function=${fn}&symbol=${currency}&market=CLP&apikey=${env.API_KEY}`;
}

const checkParams = (req, res, next) => {
  const {
    currency
  } = req.query;

  /*
    uso para limpiar bd redis
    redisClient.del('BTC');
    redisClient.del('BTCM');
    redisClient.del('ETH');
    redisClient.del('ETHM');
  */
  if (typeof currency === 'undefined' || currency === null || currency === '') {
    sendError(res, 'Error debe especificar a currency');
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

const getXHoras = (body) => {
  let arrayXHora = Object.entries(body["Time Series (Digital Currency Intraday)"])
    .filter(elem => elem[0].indexOf("00:00") > -1)
    .filter((elem, index) => index <= 23)
    .reduce((acc, item) => {
      acc[item[0]] = item[1];
      return acc;
    }, {});

  return {
    "Meta Data": body["Meta Data"],
    "Time Series (Digital Currency Intraday)": arrayXHora
  };
};

const getLast = (body) => {
  let arrayLastMonth = Object.entries(body["Time Series (Digital Currency Monthly)"])
    .filter((elem, index) => index <= 11)
    .reduce((acc, item) => {
      acc[item[0]] = item[1];
      return acc;
    }, {});

  return {
    "Meta Data": body["Meta Data"],
    "Time Series (Digital Currency Monthly)": arrayLastMonth
  };
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
      sendError(res, er);
    }
  })
};

export default {
  makeUrl,
  checkParams,
  getCurrency,
  getCurrenyOnRedis,
  redisClient,
  getXHoras,
  getLast
};


