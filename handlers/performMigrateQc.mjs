// import { listQc } from "./common/listQc.mjs";
import { describeQc } from "./common/describeQc.mjs";
import { scanItemFromDDB } from "./common/scanArnTable.mjs";
import { createQc } from "./common/createQc.mjs";
import { updateQc } from "./common/updateQc.mjs";

export const performMigrateQc = async (parsedBody) => {
  let migrationResultArray = [];
  // Step 1 get the list from src env
  // const srcList = await listQc(parsedBody.srcRegion, parsedBody.srcInstanceId,parsedBody.QuickConnectTypes);
  // op -> [{ 'Arn': '', 'Id':'','Name': ''}]
  // Step 2 Describe each HOP and create 
  const detailedSrcList = [];
  for (let qcListItem of parsedBody.selectedItem) {
      const qcDescription = await describeQc(parsedBody.srcRegion, parsedBody.srcInstanceId, qcListItem);
    // op -> { QuickConnectId, QuickConnectARN, Name, Description Tags}
    qcListItem = { ...qcDescription };
    detailedSrcList.push(qcListItem);
  }
  // Step 3 the udpate arn table to be udpated to udpate arn table with hop list - completed
  // Step 4 identify either to update HOP or create HOP
  for (let qcItem of detailedSrcList) {
    console.log(JSON.stringify({qcItem}));
    const tableName = process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`],
      filterExpression = `#QCN = :QCV`,
      expressionAttributeNames = {
          '#QCN': 'Name'
      },
      expressionAttributeValues = {
          ':QCV': qcItem.Name
      }
      console.log(JSON.stringify({tableName}));
    const qcAvailable = await scanItemFromDDB(tableName, filterExpression, expressionAttributeNames, expressionAttributeValues);
    console.log(JSON.stringify({qcAvailable}));
    // op -> { Count }
    if (qcAvailable.Count > 0) {
      // update quick Connect
       const updateapiInput = { 
        InstanceId: parsedBody.destInstanceId,
        QuickConnectId:qcAvailable.Items[0].Id,
        Name: qcItem.Name, 
        Description: qcItem.Description? qcItem.Description : qcItem.Name
      };
      console.log(" the HOP " + qcItem.Name + " already exist in " +parsedBody.destInstanceId + ", so updating the value");
      let resp = await updateQc(parsedBody.destRegion, updateapiInput);
      resp.name = updateapiInput.Name;
      migrationResultArray.push(resp);
    } else {
      // create quick Connect
      const createapiInput = { 
        InstanceId: parsedBody.destInstanceId,
        Name: qcItem.Name, 
        Description: qcItem.Description? qcItem.Description : qcItem.Name,
        QuickConnectConfig: qcItem.QuickConnectConfig, 
        Tags: qcItem.Tags,
      };
      console.log(" the HOP " + qcItem.Name + " does not exist in " +parsedBody.destInstanceId + ", so creating");
      let resp = await createQc(parsedBody.destRegion, createapiInput);
      resp.name = createapiInput.Name;
      migrationResultArray.push(resp);
    }
  }
  
  return migrationResultArray;
};