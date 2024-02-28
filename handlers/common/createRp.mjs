import { ConnectClient, CreateRoutingProfileCommand } from "@aws-sdk/client-connect"; 

export const createRp = async(region, inputValues) => {
    console.log("Inside Create Rp")
    console.log(JSON.stringify({region, inputValues}));
    const client = new ConnectClient({region: region});
    const command = new CreateRoutingProfileCommand(inputValues);
    const response = await client.send(command);
    console.log(JSON.stringify({response}));
    return response;
};