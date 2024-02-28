const deleteObjects = require('./common/deleteObjects.js');
const corSetting = require('./common/constants')
const s3PromptEventLogHelper = require('./common/s3PromptEventLogHelper.js');
const cognitoTokenParser = require('./common/cognitoTokenParser.js');

const BucketName = process.env.BucketName;

exports.deletePrompt = async function(event, context, callback) {
    console.info('event:', event);

    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    const body = JSON.parse(event.body)   
    const username = cognitoTokenParser.getUserId(event.headers.Authorization);
    console.info('username:', username);

    var s3ObjectPath = body.s3ObjectPath;
    
    console.info('post body :', s3ObjectPath);

    var s3Output = await deleteObjects.deleteObjects(BucketName, s3ObjectPath);

    if(s3Output){
        var requestId = username + "_" + s3ObjectPath + "_" + Date.now();
        await s3PromptEventLogHelper.saveData(requestId, BucketName, s3ObjectPath, username, 'DELETE') ;
    }

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(s3Output)
    };
    callback(null, response);
}