import { listQueueOp } from "./common/listQueue.mjs";
import { describeQueue } from "./common/describeQueue.mjs";
import { scanItemFromDDB } from "./common/scanArnTable.mjs";
import { createQueue } from "./common/createQueue.mjs";
import { updateQueue } from "./common/updateQueue.mjs";
import { getItemFromDDB } from "./common/getItemFromDDB.mjs";
import { updateHopQueue } from "./common/updateHopQueue.mjs";
import { updateQueueMax } from "./common/updateQueueMax.mjs";



export const getDestHopId = async (srcInstanceId, destInstanceId, hopId, srcRegion, destRegion, QueueName) => {
  const returnObject = {};
  console.log("Input for new function", hopId)
  const getSrcHopDet = await getItemFromDDB(hopId, process.env[`instance_${srcInstanceId.replaceAll("-", "")}`], srcRegion);
  const getSrcHopName = getSrcHopDet['Item']['Name'];
  const filterExpression = `#HOPN = :HOPN`;
  const expressionAttributeNames = {
    '#HOPN': 'Name'
  },
    expressionAttributeValues = {

      ':HOPN': getSrcHopName
    };
  const destQueueDet = await scanItemFromDDB(process.env[`instance_${destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues, destRegion);
  console.log("Result from get table", destQueueDet)
  if (destQueueDet.Count === 1) {
    returnObject.value = destQueueDet.Items[0].Id
    returnObject.error = false
    returnObject.name = QueueName
  } else {
    returnObject.error = true
    returnObject.name = QueueName
    returnObject.statusCode = '201'
    returnObject.reason = `The HOP ${getSrcHopName} is not available in ${destInstanceId}`
  }
  console.log("Return Object", returnObject)
  return returnObject
}



export const performMigrateQueue = async (parsedBody) => {
  console.log("inside queue", parsedBody)
  
  //   {
  //   command: 'MIGRATE_QUEUE',
  //   srcInstanceId: 'aa6d3090-628d-4e8c-be44-97e5d16e594c',
  //   srcRegion: 'us-east-1',
  //   destInstanceId: '55bef095-be46-4ef6-bfec-32eeb87d3279',
  //   destRegion: 'us-east-1',
  //   selectedQueue: [
  //     '0622fe3e-564c-4e04-855d-f304b8551f46',
  //     '0af03686-bd8d-4555-9c4b-372fc98a85a4'
  //   ]
  // }
  

  
  let migrationResultArray = [];
  let result = {}
  // Step 1 get the list from src env
  // const srcList = await listQueueOp(parsedBody);
  // op -> [{ 'Arn': '', 'Id':'','Name': ''}]
  // Step 2 Describe each Queue and create 
  const detailedSrcList = [];
    for (let queueListItem of parsedBody.selectedItem) {
      const queueDescription = await describeQueue(parsedBody.srcRegion, parsedBody.srcInstanceId, queueListItem);

      // op -> { QueueId, QueueArn, Name, Description, Tags}
      queueListItem = { ...queueDescription };
      detailedSrcList.push(queueListItem);

    }

  console.log("Detail list", detailedSrcList)

  // Step 3 the udpate arn table to be udpated to udpate arn table with hop list - completed
  // Step 4 identify either to update HOP or create HOP
  for (let QueueItem of detailedSrcList) {
    console.log(JSON.stringify({ QueueItem }));
    const tableName = process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`],
      filterExpression = `#QUEUEN = :QUEUEV`,
      expressionAttributeNames = {
        '#QUEUEN': 'Name'
      },
      expressionAttributeValues = {
        ':QUEUEV': QueueItem.Name
      }
    const QueueAvailable = await scanItemFromDDB(tableName, filterExpression, expressionAttributeNames, expressionAttributeValues);
    // op -> { Count }
    console.log("QueueAvailable",JSON.stringify({ QueueAvailable }));
    const finalRespone = {};
    if (QueueAvailable.Count > 0) {

      console.log("update Logic");
      
      try {
        const destHopId = await getDestHopId(parsedBody.srcInstanceId, parsedBody.destInstanceId, QueueItem.HoursOfOperationId, parsedBody.srcRegion, parsedBody.destRegion, QueueItem.Name)
        console.log("Destination hop", destHopId)
        if (destHopId.error) {
          throw (destHopId)
        }

        const updateHopInput = {
          InstanceId: parsedBody.destInstanceId,
          QueueId: QueueAvailable.Items[0].Id,
          HoursOfOperationId: destHopId.value
        };

        console.log("updateHopInput", updateHopInput)
        let resp = await updateHopQueue(parsedBody.destRegion, updateHopInput);
        console.log("resp from updateHopQueue", resp)
        if(resp['$metadata'].httpStatusCode == '200'){
          finalRespone.statusCode = '200';
          finalRespone.error = false;
          finalRespone.name = QueueItem.Name;

        }
        // resp.name = QueueItem.Name;
        // console.log("name", resp.name)
        // finalRespone.updateHopQueue = resp
        // migrationResultArray.push(finalRespone);


        const updateQueueMaxInput = {
          InstanceId: parsedBody.destInstanceId,
          QueueId: QueueAvailable.Items[0].Id
        };
        console.log("updateQueueMaxInput", updateQueueMaxInput)
        let resp1 = await updateQueueMax(parsedBody.destRegion, updateQueueMaxInput);
        console.log("resp from updateQueueMaxInput", resp1)
        // finalRespone.updateQueueMax = resp1
        // resp1.name = QueueItem.Name;
        // migrationResultArray.push(resp1)
        if(resp1['$metadata'].httpStatusCode == '200'){
          finalRespone.statusCode = '200'
          finalRespone.error = false
          finalRespone.name = QueueItem.Name;

        }


        const updateQueuenameInput = {
          InstanceId: parsedBody.destInstanceId,
          QueueId: QueueAvailable.Items[0].Id,
          Name: QueueItem.Name,
          Description: QueueItem.Description ? QueueItem.Description : QueueItem.Name

        };
        console.log("updateQueuenameInput", updateQueuenameInput)
        let resp2 = await updateQueue(parsedBody.destRegion, updateQueuenameInput);
        console.log("resp from updateQueue", resp2)
        // resp2.name = updateQueuenameInput.Name;
        // finalRespone.updateQueue = resp2
        
        // result.statusCode =  finalRespone.updateQueue['$metadata'].httpStatusCode === 200 && finalRespone.updateQueueMax['$metadata'].httpStatusCode === 200 && finalRespone.updateHopQueue['$metadata'].httpStatusCode === 200 ? "200" : "201";
        // result.name = QueueItem.Name;
        
        if(resp2['$metadata'].httpStatusCode == '200'){
          finalRespone.statusCode = '200'
          finalRespone.error = false
          finalRespone.name = QueueItem.Name;

        }

        migrationResultArray.push(finalRespone);


      } catch (error) {
        finalRespone.error = true;
        finalRespone.statusCode = '404';
        finalRespone.name = QueueItem.Name;
        finalRespone.reason = error;
        migrationResultArray.push(finalRespone);
      }



    } else {
      console.log("Create Logic")
      try {
        const destHopId = await getDestHopId(parsedBody.srcInstanceId, parsedBody.destInstanceId, QueueItem.HoursOfOperationId, parsedBody.srcRegion, parsedBody.destRegion)
        console.log("Dest hop od", destHopId)
        if (destHopId.error) {
          destHopId.Name = QueueItem.Name
          throw (destHopId)
        }
        const createapiInput = {
          InstanceId: parsedBody.destInstanceId,
          Name: QueueItem.Name,
          Description: QueueItem.Description ? QueueItem.Description : QueueItem.Name,
          //  OutboundCallerConfig:QueueItem.OutboundallerConfig
          HoursOfOperationId: destHopId.value
        };
        let resp = await createQueue(parsedBody.destRegion, createapiInput);
        resp.name = createapiInput.Name;
        console.log("resp is", resp);
        if(resp['$metadata'].httpStatusCode == '200'){
          finalRespone.statusCode = '200'
          finalRespone.error = false
          finalRespone.name = QueueItem.Name;

        }
        migrationResultArray.push(finalRespone);

      } catch (error) {
        console.log("inside catch")
        finalRespone.error = true;
        finalRespone.statusCode = '404';
        finalRespone.name = QueueItem.Name;
        migrationResultArray.push(finalRespone)
      }


    }

  }
  console.log("Final Array", migrationResultArray)
  // if()
  return migrationResultArray;
};