const { DynamoDBDocumentClient, ScanCommand } =require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require ("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const scanItemFromDDB = {
    async scanItemFromDDB (tableName, filterExpression, expressionAttributeNames, expressionAttributeValues) {
        console.log({tableName, filterExpression, expressionAttributeNames, expressionAttributeValues});
        const resp = await ddbDocClient.send(
            new ScanCommand({
                TableName: tableName,
                FilterExpression: filterExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues
            })
        );
        console.log({resp});
        return resp;
    }
};

module.exports = scanItemFromDDB;