import { ConnectClient, UpdateQueueNameCommand  } from "@aws-sdk/client-connect";

export const updateQueue = async(region, inputValues) => {
     console.log(JSON.stringify({region, inputValues}));
    const client = new ConnectClient({region: region});
    const command = new UpdateQueueNameCommand (inputValues);
    const response = await client.send(command);
    console.log(JSON.stringify({response}));
    return response;
};