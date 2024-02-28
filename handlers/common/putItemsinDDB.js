const {
    DynamoDBDocumentClient,
    PutCommand
} =require("@aws-sdk/lib-dynamodb");
const {DynamoDBClient } = require ("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const putItemsinDDB = {
    async putItemsinDDB (tableName, item) {
          return await ddbDocClient.send(
                new PutCommand({
                    TableName:tableName,
                    Item:item
                })
            );
        }
};

module.exports = putItemsinDDB;