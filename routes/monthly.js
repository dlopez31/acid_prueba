import util from '../libs/utils';

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
    });

};