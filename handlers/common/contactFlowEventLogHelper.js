
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    sslEnabled: false,
    paramValidation: false,
    convertResponseTypes: false
});
const tableName = process.env.EventTable;

const contactFlowEventLogHelper = {
    async saveData(requestId, instanceid, userId, contactflowoutputName, s3ObjectPath, operation, sourceInstanceId, destinationinstanceId) {
        console.log({requestId, instanceid, userId, contactflowoutputName, s3ObjectPath, operation, sourceInstanceId, destinationinstanceId});
        let inputTextToDB;
        switch (operation) {
            case 'IMPORT':
                console.log("Inside Import");
                inputTextToDB = '{"requestId": "' + requestId +
                    '","userId": "' + userId +
                    '","InstanceId": "' + instanceid +
                    '","ContactFlowName": "' + contactflowoutputName +
                    '","operation": "' + operation +
                    '","timestampDate" : "' + new Date().toISOString() + '"}';
                break;
            case 'MIGRATE':
                inputTextToDB = '{"requestId": "' + requestId +
                    '","userId": "' + userId +
                    '","sourceInstanceId": "' + sourceInstanceId +
                    '","destinationinstanceId": "' + destinationinstanceId +
                    '","ContactFlowName": "' + contactflowoutputName +
                    '","operation": "' + operation +
                    '","timestampDate" : "' + new Date().toISOString() + '"}';
                break;
        }
        const paramsIns = {
            TableName: tableName,
            Item: JSON.parse(inputTextToDB)
        };

        console.log('contactFlowEventLogHelper saveData paramsIns', paramsIns);
        const response = await docClient.put(paramsIns).promise();
        console.log('contactFlowEventLogHelper saveData response', response);
        return response;
    }
};

module.exports = contactFlowEventLogHelper; 