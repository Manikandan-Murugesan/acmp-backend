const region = process.env.AWS_REGION;
const region2=process.env.Region2;

const { ConnectClient, ListPromptsCommand } = require("@aws-sdk/client-connect");

//r
const listConnectPrompts = {
    async   listConnectPrompts(InstanceId,srcRegion, NextToken="") {
        const client = new ConnectClient({ region: srcRegion });
        console.log("inside List Connect",InstanceId)
        let response = null;
        try {
            const input = { 
                InstanceId: InstanceId
            };
            console.log("inout",input)
            if(!!NextToken) input.NextToken = NextToken;
            const command = new ListPromptsCommand(input);
            console.log("Command",command)
            response = await client.send(command);
            console.log("response",response)
        } catch (error) {
            console.error(error);
            return error;
        }
        return response;
    }
};
module.exports = listConnectPrompts;