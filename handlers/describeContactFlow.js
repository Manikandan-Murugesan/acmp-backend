const corSetting = require('./common/constants');
const { describeFlow } = require('./common/describeFlow.js');
const s3PresignedUrl = require('./common/s3PresignedUrl.js');
const uploadObject = require('./common/uploadObject.js');
const cognitoTokenParser = require('./common/cognitoTokenParser.js');
const contactFlowEventLogHelper = require('./common/contactFlowEventLogHelper.js');
const BucketName = process.env.BucketName;
//r

let response = {}
const describeContactFlow = async (event, context, callback) => {
    return new Promise (async(res, rej) => {
    try{
    console.log(JSON.stringify({ event }))
    if (event.httpMethod !== 'POST') {
        throw new Error(`createcontactFlow only accepts post method, you tried: ${event.httpMethod} method.`);
    }
    
    const instanceid = JSON.parse(event.body).InstanceId; 
    const ContactFlowId =JSON.parse(event.body).ContactFlowId;
    const ContactFlowName = JSON.parse(event.body).ContactFlowName;

    console.log({instanceid, ContactFlowId, ContactFlowName})
    const flowOutput = await describeFlow(instanceid, ContactFlowId)
    console.log("Flow output--", flowOutput)

    var contactflowoutput = flowOutput.ContactFlow
    console.log("ContactFlowOutput--", flowOutput)

    // need to check

    var s3ObjectPath = `${instanceid}/${ContactFlowId}/${ContactFlowName}_${new Date().toISOString().split('T')[0]}.json`;
    console.log("S3object path",s3ObjectPath)
    let fileContent = contactflowoutput
    var fileresponse = JSON.stringify(fileContent)
    var output = await uploadObject.uploadFile(BucketName, s3ObjectPath, fileresponse);
    console.log("Output--", output)

    var presignedUrl = '';
    console.log('post body :', s3ObjectPath);

    if (s3ObjectPath) {
        presignedUrl = await s3PresignedUrl.getPresignedUrl(BucketName, s3ObjectPath);
    }
    
    
    var contactflowoutputName=flowOutput.ContactFlow.Name
    console.log("Name-->",contactflowoutputName)
    
    
        const username = cognitoTokenParser.getUserId(event.headers.Authorization);
      console.info('username:', username);

          var requestId = username + "_" + Date.now();
        
          console.log("Request ID",requestId)
          var operation="IMPORT"
          await contactFlowEventLogHelper.saveData(requestId,instanceid, username, contactflowoutputName,s3ObjectPath,operation) ;

    console.log("Pre signed URL", presignedUrl)
    response.statusCode = "200"
     response = {
    statusCode: "200",
    headers: corSetting,
    body: JSON.stringify(presignedUrl)
};
console.log("Response is",response)
res(response) 

}catch(error){
     response={
        statusCode:201,
        headers: corSetting,
        body:JSON.stringify(error.message)
    }
    console.log("response is",response)
    res(response)
}
})
}

module.exports = {
    describeContactFlow
}