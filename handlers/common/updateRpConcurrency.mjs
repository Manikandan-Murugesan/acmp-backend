import { ConnectClient, UpdateRoutingProfileConcurrencyCommand    } from "@aws-sdk/client-connect";

export const updateRpConcurrency = async(region, inputValues) => {
     console.log(JSON.stringify({region, inputValues}));
    const client = new ConnectClient({region: region});
    const command = new UpdateRoutingProfileConcurrencyCommand   (inputValues);
    const response = await client.send(command);
    console.log(JSON.stringify({response}));
    return response;
};