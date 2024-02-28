import { ConnectClient, UpdateHoursOfOperationCommand } from "@aws-sdk/client-connect";

export const updateHop = async(region, inputValues) => {
     console.log(JSON.stringify({region, inputValues}));
    const client = new ConnectClient({region: region});
    const command = new UpdateHoursOfOperationCommand(inputValues);
    const response = await client.send(command);
    console.log(JSON.stringify({response}));
    return response;
};