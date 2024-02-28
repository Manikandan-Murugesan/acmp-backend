const region = process.env.Region;
// const region2=process.env.Region2;
const { ConnectClient, ListContactFlowModulesCommand  } = require("@aws-sdk/client-connect");
//const client = new ConnectClient({ region: region });
//r
const listContactModule = {
    async listContactModule(InstanceId,srcRegion,NextToken="") {
        const client = new ConnectClient({ region: srcRegion });
        let response = null;
        try {
            const input = { 
                InstanceId: InstanceId
            };
            if(!!NextToken) input.NextToken = NextToken;
            console.log(input)
            const command = new ListContactFlowModulesCommand(input);
            response = await client.send(command);
        } catch (error) {
            console.error(error);
            response = error;
        }
        return response;
    }
};
module.exports = listContactModule;