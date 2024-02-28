import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";


export const getItemFromDDB = async(Id,tableName,region) =>{
    // const client = new DynamoDBClient({region});
    const client = new DynamoDBClient({});
    const ddbDocClient = DynamoDBDocumentClient.from(client);
    const resp = await ddbDocClient.send(
                new GetCommand({
                    TableName: tableName,
                    Key: {"Id":Id} 
                })
            );
    console.log({resp});
    return resp;
    
};
