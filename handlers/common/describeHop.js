import { ConnectClient, DescribeHoursOfOperationCommand } from "@aws-sdk/client-connect";

export const describeHop = async (srcRegion, srcInstanceId, hopId) => {
    const client = new ConnectClient({ region: srcRegion });
    const input =  { // DescribeHoursOfOperationRequest
      InstanceId: srcInstanceId, // required
      HoursOfOperationId: hopId, // required
    };
    const command = new DescribeHoursOfOperationCommand(input);
    const { HoursOfOperation } = await client.send(command);
    console.log(JSON.stringify({HoursOfOperation}));
    return HoursOfOperation;
};