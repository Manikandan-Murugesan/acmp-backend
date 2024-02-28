const corSetting = require('./common/constants');

const { createContactFlow, updateContactFlow } = require('./common/createContactFlow.js');

const contactFlowEventLogHelper = require('./common/contactFlowEventLogHelper.js');
const cognitoTokenParser = require('./common/cognitoTokenParser.js');
const { scanItemFromDDB } = require('./common/scanItemFromDDB.js');
var assentaccountablename = process.env.instance_55bef095be464ef6bfec32eeb87d3279
var trainingaccounttablename = process.env.instance_aa6d3090628d4e8cbe4497e5d16e594c


exports.createcontactFlow = async function (event, context, callback) {

    let response = {
        headers: corSetting
    };

    console.log(JSON.stringify({ event }));
    if (event.httpMethod !== 'POST') {
        throw new Error(`createcontactFlow only accepts post method, you tried: ${event.httpMethod} method.`);
    }
    console.log("Main Event->", JSON.parse(event.body))
    const instanceid = JSON.parse(event.body).InstanceId;
    var testtype = JSON.parse(event.body).Type;

    var Content = JSON.parse(event.body).Content;
    console.log("Content--", Content)
    try {
        var parsedcontent = JSON.parse(Content)
        console.log("parsed content-->", parsedcontent)
        console.log("parsed content type", typeof (parsedcontent))
        var finalContent = parsedcontent.Content
        console.log("Anser", parsedcontent.Content)
        if (!parsedcontent.Content) {
            throw new Error( "invalid JSON format for contact flow content " )
        }



        var contactflowoutputName = parsedcontent.Name
        var ContactFlowId = parsedcontent.Id
        console.log("NAME__>", contactflowoutputName)
        if (!contactflowoutputName) {
            throw new Error( "invalid JSON format for contact flow content " )
        }
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
                ':FN': contactflowoutputName
            };

        var destCallFlowDet = await scanItemFromDDB(tablename, filterExpression, expressionAttributeNames, expressionAttributeValues);

        console.log("DETAILS-->", destCallFlowDet)
    } catch (e) {
        console.log("error", e)
        response.statusCode = 201;
        response.body = JSON.stringify({"error": e.message});
        return response;
    }

    try {
        let result;
        if (destCallFlowDet.Count === 0) {
            console.log("No record-- creating")
            const input = {
                InstanceId: instanceid,
                Name: contactflowoutputName,
                Type: testtype,
                Content: finalContent,
                Tags: { // TagMap
                    "CREATOR": "CN-CONNECT-MNGR",
                }
            };
            console.log("Input--", input);
            result = await createContactFlow(input);
            console.log("result is", result)

        } else {
            console.log("Record Available--Updating")
            const input = {
                InstanceId: instanceid,
                ContactFlowId: ContactFlowId,
                Content: finalContent
            };
            console.log("Input--", input);
            result = await updateContactFlow(input);
            console.log("result is", result)
        }
        if (result.$metadata.httpStatusCode == 200) {
            console.log("Inside if")
            response.statusCode = result.$metadata.httpStatusCode
            response.body = JSON.stringify({ message: "imported successfully" })
            const username = cognitoTokenParser.getUserId(event.headers.Authorization);
            console.info('username:', username);
            var requestId = username + "_" + Date.now();
            var operation = "IMPORT"
            await contactFlowEventLogHelper.saveData(requestId, instanceid, username, contactflowoutputName, '', operation, '', '');
        }
        else {
            console.log("inside else")
            response.statusCode = 203
            console.log("Res body", result.body)
            response.body = !!result.body ? JSON.stringify(result.body) : JSON.stringify({ error: JSON.stringify(result.problems) })
        };
    }
    catch (e) {
        console.log("Err", e)
        response.statusCode = 201;
        response.body = JSON.stringify(e.problems);
    }
    console.log(JSON.stringify({ response }))
    return response;
};