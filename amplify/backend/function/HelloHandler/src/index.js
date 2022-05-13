

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const awsServerlessExpress = require('aws-serverless-express');
const app = express();
// const fileUpload = require('express-fileupload');

app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
// app.use(fileUpload());

const {
    addModel,
    getModels,
    deleteModel,
    getColors
} = require('./dynamo');


const server = awsServerlessExpress.createServer(app);

exports.handler =  (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    awsServerlessExpress.proxy(server, event, context); 
};


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

app.get('/modelFetch', async (req, res) => {
    console.log(req.body)
    const userId = {id: req.body.id}
    try {
        // Fix the by adding the userId param

        // Uncomment this to work
        const models = await getModels(userId);
        
        //Comment this to work
        // const models = []
        res.json(models);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});


app.get('/getcolors', async (req, res) => {
    console.log(req.query.id)
    const id = req.query.id
    try {
        // Fix the by adding the userId param

        // Uncomment this to work
        const model = await getColors(id);
        
        //Comment this to work
        // const models = []
        console.log(model)
        res.json(model);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});

app.post('/upload',async (req,res) => {

    const model = req.body;
    console.log(model);
    try {
        //Uncomment this to work
        const newModel = await addModel(model);

        // Comment this to work
        // const newModel = [];
        res.json(newModel);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
  