// src/services/dynamoService.js

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const putItem = async (tableName, item) => {
  const params = {
    TableName: tableName,
    Item: item,
  };
  return dynamoDB.put(params).promise();
};

const getItem = async (tableName, key) => {
  const params = {
    TableName: tableName,
    Key: key,
  };
  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

const updateItem = async (tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) => {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  if (expressionAttributeNames && Object.keys(expressionAttributeNames).length > 0) {
    params.ExpressionAttributeNames = expressionAttributeNames;
  }

  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

const deleteItem = async (tableName, key) => {
  const params = {
    TableName: tableName,
    Key: key,
  };
  return dynamoDB.delete(params).promise();
};

const scanTable = async (tableName, filterExpression, expressionAttributeValues, expressionAttributeNames) => {
  const params = {
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (expressionAttributeNames && Object.keys(expressionAttributeNames).length > 0) {
    params.ExpressionAttributeNames = expressionAttributeNames;
  }

  const result = await dynamoDB.scan(params).promise();
  return result.Items;
};


module.exports = {
  putItem,
  getItem,
  updateItem,
  deleteItem,
  scanTable,
};
