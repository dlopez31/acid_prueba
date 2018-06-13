const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes= require('./routes');
const env =require('./config');
const port = env.PORT;
const redisObject =require('./redisClient');
const { redisClient } = redisObject;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api",[routes])

redisClient.on("error",function(error){
  console.log(error);
})

app.listen(port,function(error){
   if(error){
     console.log("Servidor error");
   }

    console.log("server runnin", port);
})

// return getAsync("name").then(function(res) {
//     console.log(res); // => 'bar'
// });
