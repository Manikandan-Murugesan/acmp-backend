const corSetting = require('./common/constants');
const { describeModule } = require('./common/describeModule.js');
const s3PresignedUrl = require('./common/s3PresignedUrl.js');
const uploadObject = require('./common/uploadObject.js');
const contactFlowEventLogHelper = require('./common/contactFlowEventLogHelper.js');
const cognitoTokenParser = require('./common/cognitoTokenParser.js');

const BucketName = process.env.BucketName;
//r
exports.describeContactModule = async function (event, context, callback) {
    console.log(JSON.stringify({ event }))
    if (event.httpMethod !== 'POST') {
        throw new Error(`createcontactFlow only accepts post method, you tried: ${event.httpMethod} method.`);
    }
    
    const instanceid = JSON.parse(event.body).InstanceId; 
    const ContactFlowModuleId =JSON.parse(event.body).ContactFlowModuleId;
    console.log("Module ID",ContactFlowModuleId)
    const ContactModuleName = JSON.parse(event.body).ContactModuleName;
    console.log("Namee",ContactModuleName)

    console.log({instanceid, ContactFlowModuleId, ContactModuleName})
    const flowOutput = await describeModule(instanceid, ContactFlowModuleId)
    console.log("Flow output--", flowOutput)

    var contactflowoutput = flowOutput.ContactFlowModule.Content
    console.log("ContactFlowOutput--", flowOutput)

    // need to check

    var s3ObjectPath = `${instanceid}/${ContactFlowModuleId}/${ContactModuleName}_${new Date().toISOString().split('T')[0]}.json`;
    console.log("S3 object path",s3ObjectPath)
    let fileContent = contactflowoutput
    console.log("File Content is",fileContent)
    var parsedFile=JSON.parse(fileContent)
    var metadata=parsedFile.Metadata
    console.log("metadatais",metadata)
    
    // var Name=""
    const MetadataOne={
        "Name":ContactModuleName,
        "Id":ContactFlowModuleId
    }
    
    // adding module name and id

    // var returnedTarget = Object.assign(Metadata, MetadataOne);
    
    parsedFile.Metadata = {...metadata, ...MetadataOne}
    
    // console.log("New File Content is",returnedTarget)
    
    var fileresponse = JSON.stringify(parsedFile)
    console.log("File response is",fileresponse)
    var output = await uploadObject.uploadFile(BucketName, s3ObjectPath, fileresponse);
    console.log("Output--", output)

    var presignedUrl = '';
    console.log('post body :', s3ObjectPath);

    if (s3ObjectPath) {
        presignedUrl = await s3PresignedUrl.getPresignedUrl(BucketName, s3ObjectPath);
    }
    
    var contactflowoutputName=flowOutput.ContactFlowModule.Name
    console.log("Name-->",contactflowoutputName)
    
    
        const username = cognitoTokenParser.getUserId(event.headers.Authorization);
      console.info('username:', username);

          var requestId = username + "_" + Date.now();
        
          console.log("Request ID",requestId)
          await contactFlowEventLogHelper.saveData(requestId,instanceid, username, contactflowoutputName,s3ObjectPath,'IMPORT') ;



    console.log("Pre signed URL", presignedUrl)




    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(presignedUrl)
    };
    callback(null, response);
}