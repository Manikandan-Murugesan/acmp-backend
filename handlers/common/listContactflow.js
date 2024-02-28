const region = process.env.Region;
// const region2=process.env.Region2;
const { ConnectClient, ListContactFlowsCommand } = require("@aws-sdk/client-connect");
//const client = new ConnectClient({ region: region });
//r
const listContactflows = {
    async listContactflows(InstanceId,srcRegion,ContactFlowTypes,NextToken="") {

        const client = new ConnectClient({ region: srcRegion });
        let response = null;
        try {
            const input = { 
                InstanceId: InstanceId, 
                ContactFlowTypes:[ 
                    ContactFlowTypes
                    ]
            };
            if(!!NextToken) input.NextToken = NextToken;
            const command = new ListContactFlowsCommand(input);
            response = await client.send(command);
        } catch (error) {
            console.error(error)
        }
        return response;
    }
}
module.exports = listContactflows;