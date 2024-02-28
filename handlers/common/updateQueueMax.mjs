import { ConnectClient, UpdateQueueMaxContactsCommand  } from "@aws-sdk/client-connect";

export const updateQueueMax = async(region, inputValues) => {
    console.log("Inside update queue max")
     console.log(JSON.stringify({region, inputValues}));
    const client = new ConnectClient({region: region});
    const command = new UpdateQueueMaxContactsCommand (inputValues);
    const response = await client.send(command);
    console.log(JSON.stringify({response}));
    return response;
};