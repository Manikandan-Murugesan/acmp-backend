const corSetting = require('./common/constants');
const contactFlowEventLogHelper = require('./common/contactFlowEventLogHelper.js');
const cognitoTokenParser = require('./common/cognitoTokenParser.js');

const { createContactFlow, updateContactFlow } = require('./common/createContactFlow.js');
const { describeFlow } = require('./common/describeFlow.js');
const { getItemFromDDB } = require('./common/getItemFromDDB.js');
const { scanItemFromDDB } = require('./common/scanItemFromDDB.js');

const updateContactFlowLogic = async (flowContent, parsedBody,flowName) => {
    let updatedFlowContent = flowContent;
    console.log("Updated content",updatedFlowContent)
    let updatedActions = flowContent.Actions;
    let updatedMetadata = flowContent.Metadata;
    console.log("Updated meta data",updatedMetadata)
    console.log('No. of Actions Block : ', updatedActions.length);
    for (let action in updatedActions) {
        console.log(updatedActions[action]);
        switch (updatedActions[action]['Type']) {
            case 'MessageParticipant':
            case 'GetParticipantInput':
                try {
                    console.log("Updating the prompt Id");
                    if (updatedActions[action]['Parameters']['PromptId']) {
                        const srcPromptId = updatedActions[action]['Parameters']['PromptId'].split('/').reverse()[0];
                        const getSrcPromptDet = await getItemFromDDB(process.env[`instance_${parsedBody.srcInstanceId.replaceAll("-", "")}`], srcPromptId);
                        const getSrcPromptName = getSrcPromptDet['Item']['Name'];
                        const filterExpression = `#PN = :PN`;
                        const expressionAttributeNames = {
                            '#PN': 'Name'
                        },
                            expressionAttributeValues = {
                                ':PN': getSrcPromptName
                            };
                        const destPromptDet = await scanItemFromDDB(process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues);
                        console.log({ destPromptDet });
                        if (destPromptDet.Count === 1) {
                            const destPromptArn = destPromptDet['Items'][0]['Arn'];
                            updatedActions[action]['Parameters']['PromptId'] = destPromptArn;
                        } else if (destPromptDet.Count > 1) {
                            throw {
                                "error": "The Prompt " + getSrcPromptName + " is configured more than once in " + parsedBody.destInstanceId
                            };
                        } else {
                            throw {
                                "error": "The Prompt " + getSrcPromptName + " is missing in " + parsedBody.destInstanceId
                            };
                        }
                    }

                } catch (error) {
                    let errorObj = {};
                    errorObj.name=flowName
                    console.log("inside error");
                    console.log(error);
                    if (!error.error) {
                        errorObj.error = "Error in updating the prompts in the flow";
                    } else {
                        errorObj.error=error.error;
                    }
                    return errorObj;
                }
                break;
            case 'InvokeLambdaFunction':
                console.log("updating lambda function arn");
                const srcLambdaFunctionARN = updatedActions[action]['Parameters']['LambdaFunctionARN'];
                const destLambdaFunctionARN = srcLambdaFunctionARN.replaceAll(parsedBody.srcRegion, parsedBody.destRegion).replaceAll(parsedBody.srcAccountId, parsedBody.destAccountId);
                updatedActions[action]['Parameters']['LambdaFunctionARN'] = destLambdaFunctionARN;
                break;
            case 'UpdateContactTargetQueue':
                try {
                    console.log("udpating the queue arn");
                    const srcQueueId = updatedActions[action]['Parameters']['QueueId'].split('/').reverse()[0];
                    console.log("Src queue id",srcQueueId)
                    const getSrcQueueDet = await getItemFromDDB(process.env[`instance_${parsedBody.srcInstanceId.replaceAll("-", "")}`], srcQueueId);
                    const getSrcQueueName = getSrcQueueDet['Item']['Name'];
                    const filterExpression = `#QT = :QT AND #QN = :QN`;
                    const expressionAttributeNames = {
                        '#QT': 'QueueType',
                        '#QN': 'Name'
                    },
                        expressionAttributeValues = {
                            ':QT': 'STANDARD',
                            ':QN': getSrcQueueName
                        };
                    const destQueueDet = await scanItemFromDDB(process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues);
                    if (destQueueDet.Count === 1) {
                        const destQueueArn = destQueueDet['Items'][0]['Arn'];
                        updatedActions[action]['Parameters']['QueueId'] = destQueueArn;
                    } else if (destQueueDet.Count > 1) {
                        throw {
                            "error": "The Queue " + getSrcQueueName + " is configured more than once in " + parsedBody.destInstanceId
                        };
                    } else {
                        throw {
                            "error": "The Queue " + getSrcQueueName + " is missing in " + parsedBody.destInstanceId
                        };
                    }
                } catch (error) {
                    let errorObj = {};
                    errorObj.name=flowName
                    console.log("inside error");
                    console.log(error);
                    if (!error.error) {
                        errorObj.error = "Error in updating the queues";
                    } else {
                        errorObj.error=error.error;
                    }
                    return errorObj;
                }
                break;
            case 'ConnectParticipantWithLexBot':
                console.log("need to udpate the lex arn");
                break;
            case 'UpdateContactEventHooks':
                const flowType = Object.keys(updatedActions[action]['Parameters']['EventHooks'])[0];
                console.log('Update the set ' + flowType + " flow");
                const allowedFlowTypes = ['AgentWhisper', 'AgentHold', 'CustomerHold', 'CustomerWhisper', 'CustomerQueue', 'CustomerRemaining'];
                // CustomerRemaining - Disconnect  flow
                try {
                    if (allowedFlowTypes.includes(flowType)) {
                        const srcFlowId = updatedActions[action]['Parameters']['EventHooks'][`${flowType}`].split('/').reverse()[0];
                        const getSrcFlowDet = await getItemFromDDB(process.env[`instance_${parsedBody.srcInstanceId.replaceAll("-", "")}`], srcFlowId);
                        const getSrcFlowName = getSrcFlowDet['Item']['Name'];
                        const filterExpression = `#FN = :FN`;
                        const expressionAttributeNames = {
                            '#FN': 'Name'
                        },
                            expressionAttributeValues = {
                                ':FN': getSrcFlowName
                            };
                        const destFlowDet = await scanItemFromDDB(process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues);
                        if (destFlowDet.Count === 1) {
                            const destFlowArn = destFlowDet['Items'][0]['Arn'];
                            updatedActions[action]['Parameters']['EventHooks'][`${flowType}`] = destFlowArn;
                        } else if (destFlowDet.Count > 1) {
                            throw {
                                "error": "The Flow " + getSrcFlowName + " is configured more than once in " + parsedBody.destInstanceId
                            };
                        } else {
                            throw {
                                "error": "The Flow " + getSrcFlowName + " is missing in " + parsedBody.destInstanceId
                            };
                        }

                    }
                } catch (error) {
                    let errorObj = {};
                    console.log("1",errorObj)
                    errorObj.name=flowName
                    console.log("Flowname in error",flowName)
                    console.log("2",errorObj)
                    console.log("inside error");
                    console.log("error reason",error.error);
                    if (!error.error) {
                        console.log("inside if")
                        errorObj.error = "error in updating the dependent flows";
                    } else {
                        errorObj.error=error.error;
                    }
                    console.log("Final error check",errorObj)
                    return errorObj;
                }
                break;
            case 'InvokeFlowModule':
                console.log('Updating the module arn');
                try {
                    const srcModuleId = updatedActions[action]['Parameters']['FlowModuleId'].split('/').reverse()[0];
                    const getSrcModuleDet = await getItemFromDDB(process.env[`instance_${parsedBody.srcInstanceId.replaceAll("-", "")}`], srcModuleId);
                    const getSrcModuleName = getSrcModuleDet['Item']['Name'];
                    const filterExpression = `#MN = :MN`;
                    const expressionAttributeNames = {
                        '#MN': 'Name'
                    },
                        expressionAttributeValues = {
                            ':MN': getSrcModuleName
                        };
                    const destModuleDet = await scanItemFromDDB(process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues);
                    console.log({ destModuleDet });
                    if (destModuleDet.Count === 1) {
                        const destModuleArn = destModuleDet['Items'][0]['Arn'];
                        updatedActions[action]['Parameters']['FlowModuleId'] = destModuleArn;
                    } else if (destModuleDet.Count > 1) {
                        throw {
                            "error": "The Module " + getSrcModuleName + " is configured more than once in " + parsedBody.destInstanceId
                        };
                    } else {
                        throw {
                            "error": "The Module " + getSrcModuleName + " is missing in " + parsedBody.destInstanceId
                        };
                    }
                } catch (error) {
                    let errorObj = {};
                    errorObj.name=flowName
                    console.log("inside error");
                    console.log(error);
                    if (!error.error) {
                        errorObj.error = "error in updating the modules";
                    } else {
                        errorObj.error=error.error;
                    }
                    return errorObj;
                }
                break;
            default:
                console.log(`The action block ${updatedActions[action]['Type']} requires no change`);
        }
    }
    updatedFlowContent.Actions = updatedActions;
    updatedFlowContent.Metadata = updatedMetadata;
    return updatedFlowContent;
};

exports.migrateContactFlow = async function (event, context, callback) {
    const response =  { headers:corSetting}
    
    var resultArray = [] ;
   
    console.log("input event", event)
    console.log(JSON.stringify({ event }));
    if (event.httpMethod !== 'POST') {
        throw new Error(`createcontactFlow only accepts post method, you tried: ${event.httpMethod} method.`);
    }
    const parsedBody = JSON.parse(event.body);
    console.log(JSON.stringify({ parsedBody }));

    var noifcid = parsedBody.srcFlowId.length
    var contactId = parsedBody.srcFlowId
    console.log("Count is", noifcid)

    for (let i = 0; i < noifcid; i++) {

        const srcFlowOutput = await describeFlow(parsedBody.srcInstanceId, contactId[i],parsedBody.srcRegion);

        console.log("Describe flow output", JSON.stringify({ srcFlowOutput }));


        const destFlowOutput = srcFlowOutput;
        const srcFlowContent = JSON.parse(srcFlowOutput.ContactFlow.Content);
        const flowName=srcFlowOutput.ContactFlow.Name



        const updatedContent = await updateContactFlowLogic(srcFlowContent, parsedBody,flowName);
        console.log("Updated Content", updatedContent)
         let response={
         }
        

        if (!!updatedContent.error) {
            console.log("Inside update content ")
            response.statusCode = 201;
            response.body = JSON.stringify({
                "$metadata": {
                    "httpStatusCode": 201,
                    "message": updatedContent.error,
                    "name":updatedContent.name
                }
            });
            console.log("Error Response",response)
            resultArray.push(response)
            console.log("Result array when error",resultArray)

        } else {
            response.statusCode = 200;
            destFlowOutput.ContactFlow.Content = JSON.stringify(updatedContent);

            console.log("output-->", JSON.stringify({ destFlowOutput }));
            const srcCallFlowName = destFlowOutput.ContactFlow.Name;
            const filterExpression = `#FN = :FN`;
            const expressionAttributeNames = {
                '#FN': 'Name'
            },
                expressionAttributeValues = {
                    ':FN': srcCallFlowName
                };
            const destCallFlowDet = await scanItemFromDDB(process.env[`instance_${parsedBody.destInstanceId.replaceAll("-", "")}`], filterExpression, expressionAttributeNames, expressionAttributeValues);
            try {
                if (destCallFlowDet.Count === 0) {
                    const input = {
                        InstanceId: parsedBody.destInstanceId,
                        Name: destFlowOutput.ContactFlow.Name,
                        Type: parsedBody.srcFlowType,
                        Content: destFlowOutput.ContactFlow.Content,
                        Tags: { // TagMap
                            "CREATOR": "CN-CONNECT-MNGR",
                        }
                    };
                    console.log("Input--for createCf", input);
                    const result = await createContactFlow(input,parsedBody.destRegion);
                    console.log("Create Cf Result", result)
                   
                    response.name = input.Name
                    response.body = JSON.stringify(result);
                    console.log("response is",response)
                    resultArray.push(response)
                    console.log("Result array--",resultArray)
                    
                    
                } else {
                    const input = {
                        InstanceId: parsedBody.destInstanceId,
                        ContactFlowId: destCallFlowDet.Items[0].Id,
                        Content: destFlowOutput.ContactFlow.Content
                    };
                    console.log("Input--for update", input);
                    const result = await updateContactFlow(input,parsedBody.destRegion);
                    console.log("update cf result", result)
                    response.name = destFlowOutput.ContactFlow.Name
                    response.body = JSON.stringify(result);
                    console.log("response is",response)
                    resultArray.push(response)
                    console.log("Result array--",resultArray)
                    
                }
            } catch (e) {
                response.statusCode = 201;
                response.body = response.body = JSON.stringify({
                    "$metadata": {
                        "httpStatusCode": 201,
                        "message": JSON.stringify(e.problems)
                    }
                });
            }



            const username = cognitoTokenParser.getUserId(event.headers.Authorization);
            console.info('username:', username);
            const requestId = username + "_" + Date.now();
            console.log("Request ID", requestId);
            await contactFlowEventLogHelper.saveData(requestId, '', username, destFlowOutput.ContactFlow.Name, '', "MIGRATE", parsedBody.srcInstanceId, parsedBody.destInstanceId);
        }
        console.log("Response after each loop", response)
console.log("Return Array value", resultArray)
    }
    console.log("Return Array value", resultArray)

    console.log("Final Response", resultArray);
    var resultArraylength=resultArray.length
    for (let i = 0; i < resultArraylength; i++) {
        console.log("values",resultArray[i].body)
    }
    response.body = JSON.stringify(resultArray)
    response.statusCode= 200
    console.log("Exit response",response)
    callback(null, response);
};