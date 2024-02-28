const { listConnectPrompts } = require('./common/listConnectPrompts.js');
const { listQueues } = require('./common/listConnectQueues.js');
const { listContactflows } = require('./common/listContactflow.js');
const { listContactModule } = require('./common/listContactModule.js');
const { putItemsinDDB } = require('./common/putItemsinDDB');
const { listHop } = require('./common/listHop.js');
const { listRPOp } = require('./common/listRp.js');
const { listQCOp } = require('./common/listQc.js');

const getPromptList = async(instanceId,srcRegion) =>{
    let NextToken ="";
    let promptList = [];
    do {
       const Output = !!NextToken ? await listConnectPrompts(instanceId,srcRegion,NextToken): await listConnectPrompts(instanceId,srcRegion);
       promptList = [...promptList, ...Output.PromptSummaryList];
       NextToken=Output.NextToken;
    } while (NextToken);
    return promptList;
    
};
const getQueueList = async(instanceId,srcRegion) =>{
    let NextToken ="";
    let queueList = [];
    do {
       const Output = !!NextToken ? await listQueues(instanceId,srcRegion,NextToken): await listQueues(instanceId,srcRegion);
       queueList = [...queueList, ...Output.QueueSummaryList];
       NextToken=Output.NextToken;
    } while (NextToken);
    return queueList;
};
const getContactflowList = async(instanceid,srcRegion) =>{
    let flowOutputList = [];
    const cfType = [
    'CONTACT_FLOW' , 'CUSTOMER_QUEUE' , 'CUSTOMER_HOLD' , 'CUSTOMER_WHISPER' , 'AGENT_HOLD' , 'AGENT_WHISPER' , 'OUTBOUND_WHISPER' , 'AGENT_TRANSFER' , 'QUEUE_TRANSFER'
  ];
    for(let type in cfType) {
        let NextToken ="";
        do {
           const flowOutput = !!NextToken ? await listContactflows(instanceid,srcRegion,cfType[type],NextToken): await listContactflows(instanceid,srcRegion,cfType[type]);
           flowOutputList = [...flowOutputList, ...flowOutput.ContactFlowSummaryList];
           NextToken=flowOutput.NextToken;
        } while (NextToken);
    }
    return flowOutputList;
};
const getQuickConnectList = async(instanceid,srcRegion) =>{
    let flowOutputList = [];
    const qcType = ['USER' , 'QUEUE' , 'PHONE_NUMBER'];
    for(let type in qcType) {
        let NextToken ="";
        do {
           const qcOutput = !!NextToken ? await listQCOp(instanceid,qcType[type],srcRegion,NextToken): await listQCOp(instanceid,qcType[type],srcRegion);
           flowOutputList = [...flowOutputList, ...qcOutput.QuickConnectSummaryList];
           NextToken=qcOutput.NextToken;
        } while (NextToken);
    }
    return flowOutputList;
};
const getContactFlowMouduleList = async(instanceid,srcRegion) => {
    let NextToken ="";
    let moduleOutputList = [];
    do {
       const moduleOutput = !!NextToken ? await listContactModule(instanceid,srcRegion,NextToken,): await listContactModule(instanceid,srcRegion);
       moduleOutputList = [...moduleOutputList, ...moduleOutput.ContactFlowModulesSummaryList];
       NextToken=moduleOutput.NextToken;
    } while (NextToken);
    return moduleOutputList;
    
};

exports.updateArn = async function (event, context, callback) {
    console.log("Event",event)
    var dbTableName=process.env.AssetInstanceTable
    var events=JSON.parse(event.body)
    const instanceId = events.InstanceId; // req body and region 
    console.log("ISID",instanceId)
        const srcRegion = events.srcRegion;
    const tableName=dbTableName; // take from env vars
    var tablenames=process.env[`instance_${instanceId.replaceAll("-", "")}`]
    console.log("Names",tablenames)
    
    
    
    let PromptsList = await getPromptList(instanceId,srcRegion);
    let QueuesList = await getQueueList(instanceId,srcRegion);
    let ContactFlowList = await getContactflowList(instanceId,srcRegion);
    let ContactFlowModuleList = await getContactFlowMouduleList(instanceId,srcRegion);
    let HoursOfOperationList = await listHop(instanceId,srcRegion);
    let RoutingProfileList = await listRPOp(instanceId,srcRegion);
    console.log("RoutingProfileList to DB",RoutingProfileList)
    let QuickConnectList = await getQuickConnectList(instanceId,srcRegion);
    console.log(JSON.stringify({PromptsList, QueuesList, ContactFlowList, ContactFlowModuleList, HoursOfOperationList, RoutingProfileList, QuickConnectList }));
    const masterList = [...PromptsList, ...ContactFlowList, ...ContactFlowModuleList,  ...QueuesList, ...HoursOfOperationList, ...RoutingProfileList, ...QuickConnectList];
    for(let item in masterList) {
        console.log(masterList[item]);
        await putItemsinDDB(tablenames, masterList[item]);
    }
    callback(null, {
        "No. of Prompts": PromptsList.length,
        "No. of Contact Flows": ContactFlowList.length,
        "No. of Modules": ContactFlowModuleList.length,
        "No. of Queues": QueuesList.length,
        "No. of HOP": HoursOfOperationList.length,
        "No. of RPs": RoutingProfileList.length,
        "No. of Qs": QuickConnectList.length,
        "No. of Items pushed to DDB": masterList.length
        
    });
};