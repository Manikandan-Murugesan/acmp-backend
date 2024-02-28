const s3PresignedUrl = require('./common/s3PresignedUrl.js');
const corSetting = require('./common/constants')
const cognitoTokenParser = require('./common/cognitoTokenParser.js');

const BucketName = process.env.BucketName;

exports.getPresignedUrl = async function(event, context, callback) {
    console.info('event:', event);

    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    const body = JSON.parse(event.body)
    const username = cognitoTokenParser.getUserId(event.headers.Authorization);

    var s3ObjectPath = body.s3ObjectPath;

    var presignedUrl = '';

    console.info('post body :', username, s3ObjectPath);

    if(username && s3ObjectPath){
        presignedUrl = await s3PresignedUrl.getPresignedUrl(BucketName, s3ObjectPath);
    }

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(presignedUrl)
    };
    callback(null, response);
}