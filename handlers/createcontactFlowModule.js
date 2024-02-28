const corSetting = require('./common/constants');
const { createContactModule, updateContactModule } = require('./common/createContactModule.js');

const contactFlowEventLogHelper = require('./common/contactFlowEventLogHelper.js');
const cognitoTokenParser = require('./common/cognitoTokenParser.js');
const { scanItemFromDDB } = require('./common/scanItemFromDDB.js');
var assentaccountablename = process.env.instance_55bef095be464ef6bfec32eeb87d3279
var trainingaccounttablename = process.env.instance_aa6d3090628d4e8cbe4497e5d16e594c

let response = {}

exports.createcontactFlowModule = async function (event, context, callback) {
    let response = {
        headers: corSetting
    };


    console.log(JSON.stringify({ event }));
    if (event.httpMethod !== 'POST') {
        throw new Error(`createcontactFlow only accepts post method, you tried: ${event.httpMethod} method.`);
    }
    console.log("Main Event->", JSON.parse(event.body))
    var instanceid = JSON.parse(event.body).InstanceId;
    var testtype = JSON.parse(event.body).Type;

    var Content = JSON.parse(event.body).Content;
    console.log("Content--", Content)
    var parsedcontent = JSON.parse(Content)
    console.log("parsed content-->", parsedcontent)
    console.log("parsed content type", typeof (parsedcontent))
     
     
    // console.log("Anser", parsedcontent.Content)

     try
     {
    var contactModuleoutputName = parsedcontent.Metadata.Name
    console.log("Module Name",contactModuleoutputName)
    var ContactModuleId = parsedcontent.Metadata.Id
    console.log("NAME__>", ContactModuleId)
    let tempMetaData = parsedcontent.Metadata
    delete tempMetaData.Id 
    delete tempMetaData.Name
    console.log(tempMetaData)
    parsedcontent.Metadata = tempMetaData
    console.log(parsedcontent.Metadata)
    var finalContent = parsedcontent
    console.log("Final Content",finalContent)
    var tablename;
    console.log("Insitance id--", instanceid)
    var fixid = instanceid.replaceAll("-", "")
    console.log("fixid--", fixid)

    switch (fixid) {
        case 'aa6d3090628d4e8cbe4497e5d16e594c':
            console.log("Inside Training")
            tablename = trainingaccounttablename
            break;
        case '55bef095be464ef6bfec32eeb87d3279':
            console.log("Inside Asset")
            tablename = assentaccountablename
            break;

    }

    console.log("Tablename after switch--", tablename)

    const filterExpression = `#FN = :FN`;
    const expressionAttributeNames = {
        '#FN': 'Name'
    },
        expressionAttributeValues = {
            ':FN': contactModuleoutputName
        };

    var destCallFlowDet = await scanItemFromDDB(tablename, filterExpression, expressionAttributeNames, expressionAttributeValues);
    console.log("DETAILS-->", destCallFlowDet)
     }catch(e){
        console.log("error",e)
    }

    try {
        let result;
        if (destCallFlowDet.Count === 0) {
            console.log("No record-- creating")
            const input = {
                InstanceId: instanceid,
                Name: contactModuleoutputName,
                Type: testtype,
                Content:JSON.stringify(finalContent) ,
                Tags: { // TagMap
                    "CREATOR": "CN-CONNECT-MNGR",
                }
            };
            console.log("Input--", input);
            result = await createContactModule(input);
            console.log("result is", result)
        }
        else {
            console.log("Record Available--Updating")
            const input = {
                InstanceId: instanceid,
                ContactFlowModuleId: ContactModuleId,
                Content: JSON.stringify(finalContent)
            };
            console.log("Input--", input);
            result = await updateContactModule(input);
            console.log("result is", result)
        }
        if (result.$metadata.httpStatusCode == 200) {
            console.log("Inside if")
            response.statusCode = result.$metadata.httpStatusCode
            response.body = JSON.stringify({message: "imported successfully"})
            const username = cognitoTokenParser.getUserId(event.headers.Authorization);
            console.info('username:', username);
            var requestId = username + "_" + Date.now();
            var operation = "IMPORT"
            await contactFlowEventLogHelper.saveData(requestId, instanceid, username, contactModuleoutputName, '', operation, '', '');
        }
        else {
            console.log("inside else")
            response.statusCode = 203
            console.log("Res body",result.body)
            response.body = !!result.body ? JSON.stringify(result.body) : JSON.stringify({error: JSON.stringify(result.Problems)})
        };
    }
            
    catch (e) {
        console.log("Err",e)
        response.statusCode = 201;
        response.body = JSON.stringify(e.problems);
    }
    console.log(JSON.stringify({ response }))
    return response;


}