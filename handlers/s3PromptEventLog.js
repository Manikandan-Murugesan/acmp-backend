const corSetting = require('./common/constants')
const s3PromptEventLogHelper = require('./common/s3PromptEventLogHelper.js');

exports.getS3PromptEventLog = async function(event, context, callback) {
    console.info('received:', event);
    
    var result = await s3PromptEventLogHelper.scans3PromptEventLog();

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(result)
    };
    callback(null, response);
}