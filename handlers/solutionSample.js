// Copyright 2022 Amazon.com and its affiliates; all rights reserved. This file is Amazon Web Services Content and may not be duplicated or distributed without permission.
const s3 = new (require('aws-sdk')).S3();
const response = require('cfn-response');
const sourceBucket = 'aws-contact-center-blog';
const sourcePrefix = 'amazon-s3-prompt-ui';
const sourceObjectArray = [
  'index.zip',
  's3PromptUi.zip'
];
exports.handler = async (event, context) => {
    var result = {responseStatus: 'FAILED', responseData: {Data: 'Never updated'}};
    try {
        console.log(`Received event with type ${event.RequestType}`); 
        if(event.RequestType === 'Create' || event.RequestType === 'Update') {
            copyResult = await Promise.all(
                sourceObjectArray.map( async (object) => {
                    s3Result = await s3.copyObject({
                        Bucket: event.ResourceProperties.SolutionSourceBucket,
                        Key: object,
                        CopySource: `${sourceBucket}/${sourcePrefix}/${object}`
                    }).promise();
                    console.log(`Finished uploading File with result ${JSON.stringify(s3Result, 0, 4)}`);
                }),
            );
            result.responseStatus = 'SUCCESS';
            result.responseData['Data'] = 'Successfully uploaded files';
        } else if (event.RequestType === 'Delete') {
            result.responseStatus = 'SUCCESS',
            result.responseData['Data'] = 'Successfully deleted files';
        }
    } catch (error) {
        console.log(JSON.stringify(error, 0, 4));
        result.responseStatus = 'FAILED';
        result.responseData['Data'] = 'Failed to process event';
    } finally {
        return await responsePromise(event, context, result.responseStatus, result.responseData, `mainstack`);
    }
};
function responsePromise(event, context, responseStatus, responseData, physicalResourceId) {
    return new Promise(() => response.send(event, context, responseStatus, responseData, physicalResourceId));
}
