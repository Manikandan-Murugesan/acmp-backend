const corSetting = require('./common/constants');
const { listContactflows } = require('./common/listContactflow');

const BucketName = process.env.BucketName;

exports.contactFlowList = async function (event, context, callback) {
    console.log(JSON.stringify({ event }))
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accepts GET method, you tried: ${event.httpMethod} method.`);
    }
    const body = event.body;
    const parameters = event.queryStringParameters
    const instanceid = parameters.instanceId;
    const srcRegion=parameters.region
    const ContactFlowTypes = parameters.ContactFlowTypes;
    let NextToken =""
    
    //const flowOutput = await listContactflows(instanceid, cfType)

    let flowOutputList = []
    do {
       console.log(!!NextToken) 
       const flowOutput = !!NextToken ? await listContactflows(instanceid,ContactFlowTypes,srcRegion,NextToken): await listContactflows(instanceid,ContactFlowTypes,srcRegion)
       
       console.log("Flow output",flowOutput)
       flowOutputList = [...flowOutput.ContactFlowSummaryList]
       NextToken=flowOutput.NextToken
    } while (NextToken);
    
    
    
    
    console.log("Final",flowOutputList)
    let finalArray=[]
    var cflistcount=flowOutputList.length
    for (let i = 0; i < cflistcount; i++) {
        var cfStatus=flowOutputList[i].ContactFlowStatus
        if (cfStatus =="PUBLISHED"){
            finalArray.push(flowOutputList[i])
        }
    }
    console.log("dinal array",finalArray)

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(finalArray)
    };
    console.log(JSON.stringify({response}));
    callback(null, response);
}