
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
	apiVersion: '2012-08-10',
	sslEnabled: false,
	paramValidation: false,
	convertResponseTypes: false
});
const tableName = process.env.EventTable;

const s3PromptEventLogHelper = {
	async saveData(requestId, bucketName, key, userId, operation) {

		var inputTextToDB = '{"requestId": "' + requestId +
			'","bucketName": "' + bucketName +
			'","key": "' + key +
			'","userId": "' + userId +
			'","operation": "' + operation +
			'","timestampDate" : ' + Date.now() + '}';

		console
		var paramsIns = {
			TableName: tableName,
			Item: JSON.parse(inputTextToDB)
		};

		console.log('s3PromptEventLogHelper saveData paramsIns', paramsIns);
		const response = await docClient.put(paramsIns).promise();
		console.log('s3PromptEventLogHelper saveData response', response);
		return response;
	},
	async gets3PromptEventLog(contactId) {
		var params = {
			TableName : tableName,
			KeyConditionExpression: "#contactId = :contactId",
			ExpressionAttributeNames:{
				"#contactId": "contactId"
			},
			ExpressionAttributeValues: {
				":contactId": contactId
			}
		};
		
		var output = await docClient.query(params).promise();
		return output;
	},
    async scans3PromptEventLog() {
        const params = {
            TableName: tableName,
        };

        let scanResults = [];
        let items;

		items = await docClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));

        console.info('scanResults:', scanResults);
        return scanResults;
    }
}

module.exports = s3PromptEventLogHelper;