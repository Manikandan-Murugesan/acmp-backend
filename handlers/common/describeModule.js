const region = process.env.AWS_REGION;

const { ConnectClient, DescribeContactFlowModuleCommand } = require("@aws-sdk/client-connect");
//const client = new ConnectClient({ region: region });

const describeModule = {
    async describeModule(InstanceId, ContactFlowModuleId,desRegion) {
    const client = new ConnectClient({ region: desRegion });
          let response = null;
        try {
          
            const input = { // ListContactFlowsRequest
                InstanceId: InstanceId, // required
                ContactFlowModuleId: ContactFlowModuleId
                
            };
            const command = new DescribeContactFlowModuleCommand (input);
            response = await client.send(command);
        } catch (error) {
            console.error(error)
        }
        return response;
    }
}
module.exports = describeModule;