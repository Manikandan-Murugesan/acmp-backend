const corSetting = require('./common/constants');
const { listInstanceFlow } = require('./common/listInstanceFlow');

const BucketName = process.env.BucketName;

exports.listInstance = async function (event, context, callback) {
    console.log("event",JSON.stringify({ event }))
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accepts GET method, you tried: ${event.httpMethod} method.`);
    }
    let instanceList = []
    // const body = event.body;
    // const NextToken = body.NextToken;
    
    let NextToken =""
    do {
     console.log(!!NextToken) 
       var flowOutput =  !!NextToken  ? await listInstanceFlow(NextToken): await listInstanceFlow()
       instanceList = [...flowOutput.InstanceSummaryList]
    } while (flowOutput.NextToken);

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(instanceList)
    };
    callback(null, response);
}