const uploadObject = require('./common/uploadObject.js');
const corSetting = require('./common/constants')
const s3PromptEventLogHelper = require('./common/s3PromptEventLogHelper.js');
const cognitoTokenParser = require('./common/cognitoTokenParser.js');

const BucketName = process.env.BucketName;

exports.uploadFile = async function(event, context, callback) {
    console.info('event:', event);
    var output = false;
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.log(event.isBase64Encoded);
    const username = cognitoTokenParser.getUserId(event.headers.Authorization);

    var s3ObjectPath = event.headers.s3ObjectPath;
    var contentType = event.body.contentType;
    console.log(s3ObjectPath, contentType);
    
    let fileContent = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    
    if(s3ObjectPath){
        output = await uploadObject.uploadFile(BucketName, s3ObjectPath, fileContent);
        if(output){
            var requestId = username + "_" + s3ObjectPath + "_" + Date.now();
            await s3PromptEventLogHelper.saveData(requestId, BucketName, s3ObjectPath, username, 'UPLOAD') ;
        }
    }
    else{
        // If not getting s3ObjectPath 
        output = false;        
    }

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: output
    };
    callback(null, response);
}