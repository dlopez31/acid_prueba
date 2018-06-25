import util from '../libs/utils';
import message from '../libs/utils/message';

const { sendError } = message;

const { makeUrl,
    checkParams,
    getCurrency,
    getCurrenyOnRedis,
    redisClient } = util;

module.exports = (app, api) => {

    api.get("/monthly", checkParams, getCurrenyOnRedis, (req, res, next) => {
        let {
            currency
        } = req.query;

        const url = makeUrl("DIGITAL_CURRENCY_MONTHLY", currency)
        getCurrency(url, (err, resp, body) => {
            if (err) {
                sendError(res, err);
            }

           if (JSON.parse(body).hasOwnProperty("Error Message") || JSON.parse(body).hasOwnProperty("Information") ) {
                console.log("entro en error");
                sendError(res, body);
            } else {

                if (req.path === '/monthly') {

                    currency = `${currency}M`;
                }
                // borrar en 86400 segundos es decir una hora (60 * 60 * 24)
                redisClient.set(currency, body, 'EX', 86400);
                try {
                   res.status(200).send(JSON.parse(body));
                } catch (er) {
                    sendError(res, er);
                }
            }
        });
    });

};