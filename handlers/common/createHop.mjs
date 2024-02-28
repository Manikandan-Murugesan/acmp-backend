import { ConnectClient, CreateHoursOfOperationCommand } from "@aws-sdk/client-connect"; 

export const createHop = async(region, inputValues) => {
    console.log(JSON.stringify({region, inputValues}));
    const client = new ConnectClient({region: region});
    const command = new CreateHoursOfOperationCommand(inputValues);
    const response = await client.send(command);
    console.log(JSON.stringify({response}));
    return response;
};