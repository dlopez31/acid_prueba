import redisObject from './redisClient';

const { redisClient } = redisObject;

module.exports = app => {

    redisClient.on("error", error => {
        console.log(error);
    });

    app.listen(app.get('port'), error => {
        if (error) {
            console.log("Servidor error");
        }

        console.log(`server runnin, ${app.get('port')}`);
    });
};