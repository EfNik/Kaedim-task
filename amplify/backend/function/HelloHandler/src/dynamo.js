const AWS = require('aws-sdk');
require('dotenv').config();


// AWS.config.update({
//     region: process.env.AWS_DEFAULT_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });


const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = '3dmodels_info';
const getModels = async (userId) => {
    // Add user Id param later
    const params = {
        TableName: TABLE_NAME,
    };
    const models = await dynamoClient.scan(params).promise();
    return models;
};


const addModel = async (model) => {
    const params = {
        TableName: TABLE_NAME,
        Item: model,
    };
    return await dynamoClient.put(params).promise();
};

const deleteModel = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id,
        },
    };
    return await dynamoClient.delete(params).promise();
};

module.exports = {
    dynamoClient,
    getModels,
    addModel,
    deleteModel
};