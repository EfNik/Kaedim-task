// amplify/backend/function/mylambda/src/app.js
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");



const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function(req,res,next ){
    res.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Allow-Headers", "*")
    next();
});

app.get('/hello', function(req, res) {

    res.json({"success":"Hello World2!"})

  });

app.get('/items', function(req, res) {
    const items = ['hello', 'world']
    res.json({ success: 'get call succeed!', items });
});
  