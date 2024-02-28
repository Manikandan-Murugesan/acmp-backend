import { ConnectClient, CreateQueueCommand } from "@aws-sdk/client-connect"; 

export const createQueue = async(region, inputValues) => {
    console.log("Inside create que")
    console.log(JSON.stringify({region, inputValues}));
    const client = new ConnectClient({region: region});
    const command = new CreateQueueCommand (inputValues);
    const response = await client.send(command);
    console.log(JSON.stringify({response}));
    return response;
};