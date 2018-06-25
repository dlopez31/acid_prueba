import util from '../libs/utils';
import message from '../libs/utils/message';

const { sendError } = message;

const { makeUrl,
    checkParams,
    getCurrency,
    getCurrenyOnRedis,
    redisClient } = util;

module.exports = (app, api) => {


    api.get("/daily", checkParams, getCurrenyOnRedis, (req, res, next) => {

        const {
            currency
        } = req.query;

        const url = makeUrl("DIGITAL_CURRENCY_INTRADAY", currency);

        getCurrency(url, (err, resp, body) => {
            if (err) {
                sendError(res, err.message || err);
            }

            if (JSON.parse(body).hasOwnProperty("Error Message") || JSON.parse(body).hasOwnProperty("Information") ) {
                console.log("entro en error");
                sendError(res, body);
            } else {

                // borrar en 3600 segundos es decir una hora (60 * 60 )
                redisClient.set(currency, body, 'EX', 3600);
                try {
                    res.status(200).send(JSON.parse(body));
                } catch (er) {
                    sendError(res, err.message || er);
                }
            }

        });

    });

};