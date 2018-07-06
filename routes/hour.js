import util from '../libs/utils';
import message from '../libs/utils/message';

const { sendError } = message;

const { makeUrl,
    checkParams,
    getCurrency,
    getCurrenyOnRedis,
    redisClient,
    getXHoras } = util;

module.exports = (app, api) => {


    api.get("/hour", checkParams, getCurrenyOnRedis, (req, res, next) => {

        const {
            currency
        } = req.query;

        const url = makeUrl("DIGITAL_CURRENCY_INTRADAY", currency);

        getCurrency(url, (err, resp, body) => {
            if (err) {
                sendError(res, err.message || err);
            }

            if (JSON.parse(body).hasOwnProperty("Error Message") || JSON.parse(body).hasOwnProperty("Information")) {
                console.log("entro en error");
                sendError(res, body);
            } else {

                let resultXHoras = getXHoras(JSON.parse(body));
           
                // borrar en 3600 segundos es decir una hora (60 * 60 )
                 redisClient.set(currency, JSON.stringify(resultXHoras), 'EX', 3600);
                try {
                    res.status(200).send(resultXHoras);
                } catch (er) {
                    sendError(res, err.message || er);
                }
            }

        });

    });

};

