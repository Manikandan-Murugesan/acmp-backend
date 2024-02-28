// import { listRp } from "./common/listRp.mjs";
import { describeRp } from "./common/describeRp.mjs";
import { describeRpQueue } from "./common/describeRpQueue.mjs";
import { scanItemFromDDB } from "./common/scanArnTable.mjs";
import { createRp } from "./common/createRp.mjs";
import { updateRpName } from "./common/updateRpName.mjs";
import { getItemFromDDB } from "./common/getItemFromDDB.mjs";
import { updateRpAgentAvailability } from "./common/updateRpAgentAvailability.mjs";
import { updateRpConcurrency } from "./common/updateRpConcurrency.mjs";
import { updateRpDefaultOutboundQueue } from "./common/updateRpDefaultOutboundQueue.mjs";

export const getDestOutboundQueueid = async (srcInstanceId, destInstanceId, DefaultOutboundQueueId, srcRegion, destRegion) => {
    const returnObject = {};
    console.log("Input for get dest output", DefaultOutboundQueueId)
    const getSrcOutboundIdDet = await getItemFromDDB(DefaultOutboundQueueId, process.env[`instance_${srcInstanceId.replaceAll("-", "")}`], srcRegion);
    console.log("Inside new function", getSrcOutboundIdDet)
    const getSrcQueueName = getSrcOutboundIdDet['Item']['Name'];
    const filterExpression = `#HOPN = :HOPN`;
    const expressionAttributeNames = {
        '#HOPN': 'Name'
    },
        expressionAttributeValues = {

            ':HOPN': getSrcQueueName
        };
    const destQueueDet = await scanItemFromDDB(process.env[`instance_${destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues, destRegion);
    console.log("after table query", destQueueDet)
    if (destQueueDet.Count === 1) {
        returnObject.statusCode = '200'
        returnObject.value = destQueueDet.Items[0].Id
        returnObject.error = false
    } else {
        returnObject.statusCode = '201'
        returnObject.error = true
        returnObject.reason = `The Outbound queue ${getSrcQueueName} is not available in ${destInstanceId}`
    }
    console.log("return object", returnObject)
    return returnObject
}


export const getdestQueueConfigId = async (srcInstanceId, destInstanceId, QueueId, srcRegion, destRegion) => {
    const returnObject = {};
    console.log("Input for get dest Queue Config", QueueId)
    const getSrcOutboundIdDet = await getItemFromDDB(QueueId, process.env[`instance_${srcInstanceId.replaceAll("-", "")}`], srcRegion);
    console.log("Inside new function", getSrcOutboundIdDet)
    const getSrcQueueName = getSrcOutboundIdDet['Item']['Name'];
    const filterExpression = `#HOPN = :HOPN`;
    const expressionAttributeNames = {
        '#HOPN': 'Name'
    },
        expressionAttributeValues = {

            ':HOPN': getSrcQueueName
        };
    const destQueueDet = await scanItemFromDDB(process.env[`instance_${destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues, destRegion);
    console.log("after table query", destQueueDet)
    if (destQueueDet.Count === 1) {
        returnObject.value = destQueueDet.Items[0].Id
        returnObject.error = false
    } else {
        returnObject.error = true
        returnObject.reason = `The queue ${getSrcQueueName} is not available in ${destInstanceId}`
    }
    console.log("return object", returnObject)
    return returnObject
}




export const performMigrateRp = async (parsedBody) => {
    let migrationResultArray = [];
    // Step 1 get the list from src env
    // const srcList = await listRp(parsedBody.srcRegion, parsedBody.srcInstanceId);
    // op -> [{ 'Arn': '', 'Id':'','Name': ''}]
    // Step 2 Describe each HOP and create 
    const detailedSrcList = [];
    for (let rpListItem of parsedBody.selectedItem) {
        const rpDescription = await describeRp(parsedBody.srcRegion, parsedBody.srcInstanceId, rpListItem);
        const rpQueueDescription = await describeRpQueue(parsedBody.srcRegion, parsedBody.srcInstanceId, rpListItem);
        // need to add new ApI
        // op -> { RoutingProfileId, RoutingProfileArn, Name, Description, TimeZone, Config, Tags}
        rpListItem = { ...rpDescription, ...{ rpQueueDescription } };
        detailedSrcList.push(rpListItem);
    }
    console.log("Total rp list", detailedSrcList)
    // Step 3 the udpate arn table to be udpated to udpate arn table with hop list - completed
    // Step 4 identify either to update HOP or create HOP
    for (let rpItem of detailedSrcList) {
        console.log(JSON.stringify({ rpItem }));
        const tableName = process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`],
            filterExpression = `#RPN = :RPV`,
            expressionAttributeNames = {
                '#RPN': 'Name'
            },
            expressionAttributeValues = {
                ':RPV': rpItem.Name
            }
        const rpAvailable = await scanItemFromDDB(tableName, filterExpression, expressionAttributeNames, expressionAttributeValues);
        console.log(JSON.stringify({ rpAvailable }))
        // op -> { Count }

        const responses = {};
        if (rpAvailable.Count > 0) {
            console.log("Update logic")

            try {
                const destOutboundQueueId = await getDestOutboundQueueid(parsedBody.srcInstanceId, parsedBody.destInstanceId, rpItem.DefaultOutboundQueueId, parsedBody.srcRegion, parsedBody.destRegion)
                console.log("Output last", destOutboundQueueId)
                if (destOutboundQueueId.error) {
                    throw (destOutboundQueueId)
                }

                var updateRpAgentAvailabilityInput = {
                    InstanceId: parsedBody.destInstanceId,
                    RoutingProfileId: rpAvailable.Items[0].Id,
                    Name: rpItem.Name,
                    AgentAvailabilityTimer: rpItem.AgentAvailabilityTimer
                };


                let resp = await updateRpAgentAvailability(parsedBody.destRegion, updateRpAgentAvailabilityInput);
                // resp.name = updateRpAgentAvailabilityInput.Name;
                if (resp['$metadata'].httpStatusCode == 200) {
                    responses.name = updateRpAgentAvailabilityInput.Name
                    responses.statusCode = '200'
                }
                //  else {
                //      responses.statusCode = '201';
                //      responses.error = true;
                //      responses.reason = 'Error while updating RP Agent available time';
                //      responses.name = updateRpAgentAvailabilityInput.Name
                //  }

                // migrationResultArray.push(responses);
                console.log("resp111111", responses);


                var updateRpConcurrencyInput = {
                    InstanceId: parsedBody.destInstanceId,
                    RoutingProfileId: rpAvailable.Items[0].Id,
                    MediaConcurrencies: rpItem.MediaConcurrencies
                };

                let resp1 = await updateRpConcurrency(parsedBody.destRegion, updateRpConcurrencyInput);
                //resp1.name = updateRpConcurrencyInput.Name;
                if (resp1['$metadata'].httpStatusCode == 200) {
                    responses.statusCode = '200'
                }
                //  else {
                //      responses.statusCode = '201';
                //      responses.error = true;
                //      responses.reason = 'Error while updating RP Concurrency Input';
                //  }
                // migrationResultArray.push(responses);
                console.log("resp222", responses);

                var updateRpDefaultOutboundQueueInput = {
                    InstanceId: parsedBody.destInstanceId,
                    RoutingProfileId: rpAvailable.Items[0].Id,
                    DefaultOutboundQueueId: destOutboundQueueId.value,
                };

                let resp2 = await updateRpDefaultOutboundQueue(parsedBody.destRegion, updateRpDefaultOutboundQueueInput);
                //resp1.name = updateRpConcurrencyInput.Name;
                if (resp2['$metadata'].httpStatusCode == 200) {
                    responses.statusCode = '200'
                }
                //  else {
                //      responses.statusCode = '201';
                //      responses.error = true;
                //      responses.reason = 'Error while updating RP DefaultOutboundQueue';
                //  }
                // migrationResultArray.push(responses);
                console.log("resp333", responses);


                var updateRpNameInput = {
                    InstanceId: parsedBody.destInstanceId,
                    RoutingProfileId: rpAvailable.Items[0].Id,
                    Name: rpItem.Name,
                    Description: rpItem.Description ? rpItem.Description : rpItem.Name,
                };

                let resp3 = await updateRpName(parsedBody.destRegion, updateRpNameInput);
                // resp3.name = updateRpNameInput.Name;

                if (resp3['$metadata'].httpStatusCode == 200) {
                    responses.statusCode = '200'
                } 
                // else {
                //     responses.statusCode = '201';
                //     responses.error = true;
                //     responses.reason = `Error while updating RP ${updateRpConcurrencyInput.Name} DefaultOutboundQueue`;
                // }

                migrationResultArray.push(responses);
                console.log("resp444", responses);



            } catch (error) {
                responses.statusCode = '201';
                responses.error = true;
                responses.reason = error.name + ' : ' + error.message +'. Error while updating RP';
                migrationResultArray.push(responses)
            }



        } else {
            console.log("Create ")
            try {
                const destOutboundQueueId = await getDestOutboundQueueid(parsedBody.srcInstanceId, parsedBody.destInstanceId, rpItem.DefaultOutboundQueueId, parsedBody.srcRegion, parsedBody.destRegion)
                console.log("Output last", destOutboundQueueId)
                if (destOutboundQueueId.error) {
                    throw (destOutboundQueueId)
                }


                let newQueueConfig = []
                if (rpItem.rpQueueDescription) {
                    console.log("Inside Rp item desc")
                    for (let configItem of rpItem.rpQueueDescription) {
                        console.log(configItem.QueueId)
                        const sr_Queue_Id = configItem.QueueId
                        const destQueueConfigId = await getdestQueueConfigId(parsedBody.srcInstanceId, parsedBody.destInstanceId, sr_Queue_Id, parsedBody.srcRegion, parsedBody.destRegion)
                        console.log("Output last of 2nd function", destQueueConfigId)
                        if (destQueueConfigId.error) {
                            throw (destQueueConfigId)

                        }
                        //.queueReference.queueId = destQueueConfigId.value
                        const a = {
                            QueueReference: {
                                QueueId: destQueueConfigId.value,
                                Channel: configItem.Channel
                            },
                            Priority: configItem.Priority,
                            Delay: configItem.Delay
                        }
                        newQueueConfig.push(a)
                    }
                }

                var createApiInput = {
                    InstanceId: parsedBody.destInstanceId,
                    Name: rpItem.Name,
                    Description: rpItem.Description ? rpItem.Description : rpItem.Name,
                    DefaultOutboundQueueId: destOutboundQueueId.value,
                    MediaConcurrencies: rpItem.MediaConcurrencies,
                    QueueConfigs: newQueueConfig,
                    Tags: rpItem.Tags,
                };
                console.log("createApiInput", createApiInput)
                let resp = await createRp(parsedBody.destRegion, createApiInput);
                console.log("Result after createRp", resp)
                resp.name = createApiInput.Name;
                if (resp['$metadata'].httpStatusCode == 200) {
                    responses.statusCode = '200'
                    responses.error = false
                    responses.name = createApiInput.Name;

                }

                migrationResultArray.push(responses);

            } catch (error) {
                console.log("inside catch")
                console.log("Error", error)
                responses.error = true;
                responses.reason = error.name +': Error while creating new Routing Profile.'
                responses.statusCode = '404';
                responses.name = createApiInput.Name;
                migrationResultArray.push(responses)

            }
        }


    }
    console.log("final response", migrationResultArray);
    return migrationResultArray


};