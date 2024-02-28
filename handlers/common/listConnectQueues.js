const region = process.env.Region;
// const region2=process.env.Region2;
const { ConnectClient, ListQueuesCommand } = require("@aws-sdk/client-connect");
//const client = new ConnectClient({ region: region });
//r
const listQueues = {
    async listQueues(InstanceId,srcRegion,NextToken="") {
        const client = new ConnectClient({ region: srcRegion });
        let response = null;
        try {
            const input = { 
                InstanceId: InstanceId, 
                QueueTypes: ['STANDARD'],
            };
            if(!!NextToken) input.NextToken = NextToken;
            const command = new ListQueuesCommand(input);
            response = await client.send(command);
        } catch (error) {
            console.error(error);
            response = error;
        }
        return response;
    }
};
module.exports = listQueues;