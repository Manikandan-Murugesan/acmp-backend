const region = process.env.AWS_REGION;

const { ConnectClient, DescribeContactFlowCommand  } = require("@aws-sdk/client-connect");
//const client = new ConnectClient({ region: region });

const describeFlow = {
    async describeFlow(InstanceId, ContactFlowId,desRegion) {
        const client = new ConnectClient({ region: desRegion });
        let response = null;
        try {
            const input = { 
                InstanceId: InstanceId, 
                ContactFlowId: ContactFlowId
                
            };
            const command = new DescribeContactFlowCommand (input);
            response = await client.send(command);
        } catch (error) {
            console.error(error);
        }
        return response;
    }
};
module.exports = describeFlow;