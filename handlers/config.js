const corSetting = require('./common/constants')

const BucketName = process.env.BucketName;
const CognitoPool = process.env.CognitoPool;
const Region = process.env.Region;
const UserPool = process.env.UserPool;
const PromptIdentityPool = process.env.PromptIdentityPool;

exports.getConfig = async function(event, context, callback) {
    console.info('event:', event);
    var output = {};

    output.BucketName = BucketName;
    output.CognitoPool = CognitoPool;
    output.Region = Region;
    output.UserPool = UserPool;
    output.PromptIdentityPool = PromptIdentityPool;

    console.info('output:', output);

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(output)
    };
    callback(null, response);
}