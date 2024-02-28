const listObjects = require('./common/listObjects.js');
const corSetting = require('./common/constants')

const BucketName = process.env.BucketName;

function formatFileSize(bytes,decimalPoint) {
    if(bytes == 0) return '0 Bytes';
    var k = 1000,
        dm = decimalPoint || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
 }

exports.getPrompts = async function(event, context, callback) {
    var output = {};

    // All log statements are written to CloudWatch
    console.info('received:', event);
    
    var s3Output = await listObjects.getBucketObjects(BucketName, event.headers.prefix);
    var promptList = [];
    var count= 1;

    if(s3Output && s3Output.Contents){
        s3Output.Contents.forEach(function(content) {
//            if(content && (content.Key.endsWith('.wav') || content.Key.endsWith('.WAV'))){
            if(content){
                console.log("content",content)
                var prompt = {};
                prompt.id = count;
                value=formatFileSize(content.Size)
                console.log("value",value)
                prompt.size = value;
                prompt.key = content.Key;
                promptList.push(prompt);                
                count++;
            }
        });
    }

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(promptList)
    };
    callback(null, response);
}