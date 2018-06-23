const express = require('express');
import request from 'request';

import util from '../utils';
import redisObject from '../redisClient';

let router = express.Router();

const {
  redisClient
} = redisObject;

const { makeUrl } = util;

// Para eliminar los datos de redis
/*
  redisClient.del('BTC')
  redisClient.del('ETH')
  redisClient.del('BTCM')
  redisClient.del('ETHM')
*/

/*
Nombre: checkParams
Funcionalidad: Validar que se pase el parametro currency
               y que no esa null.

*/
const checkParams = (req, res, next) => {
  const {
    currency
  } = req.query;
  console.log("currency", currency);
  if (typeof currency === 'undefined' || currency === null || currency === '') {
    return res.status(400)
      .send({
        success: false,
        error: 'Error debe especificar a currency',
      });
  }
  next();
}

const simulateErrorNetwork = (cb) => {
  const randomNumber = Math.round(Math.random() * 100);
  console.log("random", randomNumber)
  if (randomNumber <= 10) {
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
}

router.get("/daily", checkParams, getCurrenyOnRedis, (req, res, next) => {
  const {
    currency
  } = req.query;
  const url = makeUrl("DIGITAL_CURRENCY_INTRADAY", currency);

  getCurrency(url, (err, resp, body) => {
    if (err) {
      return res.status(400)
        .send({
          success: false,
          error: err.message || err
        });
    }

    const result = [];
    result.push(JSON.parse(body));
    const enviBody = {
      success: true,
      message: 'Daily info',
      results: result
    }
    if (enviBody.results[0].hasOwnProperty("Error Message")) {
      console.log("entro en error");
      return res.status(400)
        .send({
          success: false,
          error: enviBody.results[0]["Error Message"]
        });
    } else {

      const enviBody1 = JSON.stringify(enviBody);
      // borrar en 3600 segundos es decir una hora (60 * 60 )
      redisClient.set(currency, enviBody1, 'EX', 3600);
      try {

        res.json(JSON.parse(enviBody1));
      } catch (er) {
        return res.status(400)
          .send({
            success: false,
            error: err.message || err
          });
      }
    }

  });

})

router.get("/monthly", checkParams, getCurrenyOnRedis, (req, res, next) => {
  let {
    currency
  } = req.query;
  const url = makeUrl("DIGITAL_CURRENCY_MONTHLY", currency)
  getCurrency(url, (err, resp, body) => {
    if (err) {
      return res.status(400)
        .send({
          success: false,
          error: err.message || err
        });
    }

    const result = [];
    result.push(JSON.parse(body));
    const enviBody = {
      success: true,
      message: 'Monthly info',
      results: result
    }
    if (enviBody.results[0].hasOwnProperty("Error Message")) {
      console.log("entro en error");
      return res.status(400).send({
        success: false,
        error: enviBody.results[0]["Error Message"]
      });

    } else {

      const enviBody1 = JSON.stringify(enviBody);
      if (req.path === '/monthly') {

        currency = `${currency}M`;
      }
      // borrar en 86400 segundos es decir una hora (60 * 60 * 24)
      redisClient.set(currency, enviBody1, 'EX', 86400);
      try {

        res.json(JSON.parse(enviBody1));
      } catch (er) {
        return res.status(400).send({
          success: false,
          error: enviBody.results[0]["Error Message"]
        });
      }
    }
  });
})

export default router ;