import { listHopOp } from "./common/listHopOp.mjs";
import { describeHop } from "./common/describeHop.mjs";
import { scanItemFromDDB } from "./common/scanArnTable.mjs";
import { createHop } from "./common/createHop.mjs";
import { updateHop } from "./common/updateHop.mjs";

export const performMigrateHop = async (parsedBody) => {
  let migrationResultArray = [];
  // Step 1 get the list from src env
  // const srcList = await listHopOp(parsedBody.srcRegion, parsedBody.srcInstanceId);
  // op -> [{ 'Arn': '', 'Id':'','Name': ''}]
  // Step 2 Describe each HOP and create 
  const detailedSrcList = [];
  for (let hopListItem of parsedBody.selectedItem) {
      const hopDescription = await describeHop(parsedBody.srcRegion, parsedBody.srcInstanceId, hopListItem);
    // op -> { HoursOfOperationId, HoursOfOperationArn, Name, Description, TimeZone, Config, Tags}
    hopListItem = {...hopDescription };
    detailedSrcList.push(hopListItem);
  }
  // Step 3 the udpate arn table to be udpated to udpate arn table with hop list - completed
  // Step 4 identify either to update HOP or create HOP
  for (let hopItem of detailedSrcList) {
    console.log(JSON.stringify({hopItem}));
    const tableName = process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`],
      filterExpression = `#HOPN = :HOPV`,
      expressionAttributeNames = {
          '#HOPN': 'Name'
      },
      expressionAttributeValues = {
          ':HOPV': hopItem.Name
      },
      apiInput = { 
        InstanceId: parsedBody.destInstanceId,
        Name: hopItem.Name, 
        Description: hopItem.Description? hopItem.Description : hopItem.Name,
        TimeZone: hopItem.TimeZone, 
        Config: hopItem.Config,
        Tags: hopItem.Tags,
      };
    const HopAvailable = await scanItemFromDDB(tableName, filterExpression, expressionAttributeNames, expressionAttributeValues,parsedBody.destRegion);
    // op -> { Count }
    if (HopAvailable.Count > 0) {
      // update hop
      console.log(" the HOP " + hopItem.Name + " already exist in " +parsedBody.destInstanceId + ", so updating the value");
      apiInput.HoursOfOperationId = HopAvailable.Items[0].Id;
      delete apiInput.Tags;
      let resp = await updateHop(parsedBody.destRegion, apiInput);
      resp.name = apiInput.Name;
      migrationResultArray.push(resp);
    } else {
      // create hop
      console.log(" the HOP " + hopItem.Name + " does not exist in " +parsedBody.destInstanceId + ", so creating");
      let resp = await createHop(parsedBody.destRegion, apiInput);
      resp.name = apiInput.Name;
      migrationResultArray.push(resp);
    }
  }
  
  return migrationResultArray;
};