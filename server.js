const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT;
app.listen(port,function(){
   if(error){
     console.log("Servidor error");
   }

    console.log("server runnin", port);
})
