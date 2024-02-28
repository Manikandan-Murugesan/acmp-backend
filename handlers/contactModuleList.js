const corSetting = require('./common/constants');
const { listContactModule } = require('./common/listContactModule');

const BucketName = process.env.BucketName;

exports.contactModuleList = async function (event, context, callback) {
    console.log(JSON.stringify({ event }))
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accepts GET method, you tried: ${event.httpMethod} method.`);
    }
    const body = event.body;
    const parameters = event.queryStringParameters
    console.log("Parameters",parameters)
    const instanceid = parameters.instanceId;
    const cfType = parameters.ContactFlowModuleState;
    const srcRegion=parameters.region
    console.log(instanceid,cfType)
    let NextToken =""


    let flowOutputList = []
    do {
       console.log(!!NextToken) 
       const flowOutput = !!NextToken ? await listContactModule(instanceid,cfType,srcRegion,NextToken): await listContactModule(instanceid,cfType,srcRegion)
       
       console.log("Flow output",flowOutput)
       flowOutputList = [...flowOutput.ContactFlowModulesSummaryList]
       NextToken=flowOutput.NextToken
    } while (NextToken);
    console.log("Final",flowOutputList)
    let finalArray=[]
    var cflistcount=flowOutputList.length
    console.log("cflistcount",cflistcount)
    for (let i = 0; i < cflistcount; i++) {
        var cfStatus=flowOutputList[i].Status
        if (cfStatus =="published"){
            finalArray.push(flowOutputList[i])
        }
    }
    console.log("dinal array",finalArray)

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(finalArray)
    };
    callback(null, response);
}   