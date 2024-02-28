import { ConnectClient, DescribeQuickConnectCommand } from "@aws-sdk/client-connect";

export const describeQc = async (srcRegion, srcInstanceId, QcId) => {
    const client = new ConnectClient({ region: srcRegion });
    const input =  { // DescribeHoursOfOperationRequest
      InstanceId: srcInstanceId, // required
      QuickConnectId: QcId, // required
    };
    const command = new DescribeQuickConnectCommand(input);
    const { QuickConnect } = await client.send(command);
    console.log(JSON.stringify({QuickConnect}));
    return QuickConnect;
};