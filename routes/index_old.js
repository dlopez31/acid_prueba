const express = require('express');
const router = express.Router();
const request = require('request');
const redisObject = require('../redisClient');
const {
  redis,
  redisClient
} = redisObject;
const util = require('../utils');
const {
  makeUrl
} = util;

redisClient.del('BTC')
redisClient.del('ETH')
redisClient.del('BTCM')
redisClient.del('ETHM')

const checkParams = (req, res, next) => {
  const {
    currency
  } = req.query;

  if (typeof currency === 'undefined' || currency === null) {
    return res.status(400).json({
      error: 'unsupported currency value'
    });
  }

  next();
}

const simulateErrorNetwork = (cb) => {
  const randomNumber = Math.round(Math.random() * 100);
  console.log("random", randomNumber)
  if (randomNumber <= 10) {
    count++;
    console.log('retry request', new Error('How Unfortunate the API Request Failed!!!'));
    return simulateErrorNetwork(cb);
  }

  cb();
}

const getCurrency = (url, cb) => {
  simulateErrorNetwork(request.bind(null, url, cb));
}

const getCurrenyOnRedis = (req, res, next) => {
  simulateErrorNetwork(serarchOnRedis.bind(null, req, res, next));
}

const serarchOnRedis = (req, res, next) => {
          let {
            currency
          } = req.query;

          if(req.path==='/monthly'){

            currency=`${currency}M`;
          }

  redisClient.get(currency, function(error, value) {
    if (error || value === null) {
      console.log("buscar en api");
      return next();
    }
    console.log("buscado en redis");
    try {
      const json = JSON.parse(value);
      res.json(json);
    } catch (er) {
      res.status(400).json({
        error: err.message || err
      })
    }
  })
}

router.get("/daily", checkParams, getCurrenyOnRedis, function(req, res, next) {
  const {
    currency
  } = req.query;
  const url = makeUrl("DIGITAL_CURRENCY_INTRADAY", currency)

  getCurrency(url, function(err, resp, body) {
    if (err) {
      return res.status(400).json(body);
    }

    if (typeof body['Error Message'] !== 'undefined') {
      console.log("entro en error");
      return res.status(400).json(body);

    } else {
      const result = [];
      result.push(JSON.parse(body));
      const enviBody = {
        success: true,
        message: 'Daily info',
        results: result
      }
      const enviBody1 = JSON.stringify(enviBody);
      // borrar en 3600 segundos es decir una hora (60 * 60 )
      redisClient.set(currency, enviBody1, 'EX', 3600);
      try {

        res.json(JSON.parse(enviBody1));
      } catch (er) {
        res.status(400).json({
          error: err.message || err
        })
      }
    }

  });

})

router.get("/monthly", checkParams, getCurrenyOnRedis, function(req, res, next) {
  let {
    currency
  } = req.query;
  const url = makeUrl("DIGITAL_CURRENCY_MONTHLY", currency)
  getCurrency(url, function(err, resp, body) {
    if (err) {
      return res.status(400).json(body);
    }
    if (typeof body['Error Message'] !== 'undefined') {

      return res.status(400).json(body);

    } else {
      const result = [];
      result.push(JSON.parse(body));
      const enviBody = {
        success: true,
        message: 'Monthly info',
        results: result
      }
      const enviBody1 = JSON.stringify(enviBody);
      if(req.path==='/monthly'){

        currency=`${currency}M`;
      }
      // borrar en 86400 segundos es decir una hora (60 * 60 * 24)
      redisClient.set(currency, enviBody1, 'EX', 86400);
      try {

        res.json(JSON.parse(enviBody1));
      } catch (er) {
        res.status(400).json({
          error: err.message || err
        })
      }
    }
  });
})

module.exports = router;
