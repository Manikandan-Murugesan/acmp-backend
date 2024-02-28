import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";


    
export const scanItemFromDDB  = async (tableName, filterExpression, expressionAttributeNames, expressionAttributeValues,region) => {
    // const client = new DynamoDBClient({region});
    const client = new DynamoDBClient({});
    const ddbDocClient = DynamoDBDocumentClient.from(client);
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
};