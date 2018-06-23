// Dependencies
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
import { PORT as port } from './config';
import redisObject from './redisClient';

const app = express();
const { redisClient } = redisObject;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", [routes])

redisClient.on("error", error => {
  console.log(error);
})

app.listen(port, error => {
  if (error) {
    console.log("Servidor error");
  }

  console.log("server runnin", port);
});
