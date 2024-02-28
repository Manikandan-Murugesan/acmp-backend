import { ConnectClient, DescribeRoutingProfileCommand } from "@aws-sdk/client-connect";

export const describeRp = async (srcRegion, srcInstanceId, rpId) => {
    const client = new ConnectClient({ region: srcRegion });
    const input =  { // DescribeHoursOfOperationRequest
      InstanceId: srcInstanceId, // required
      RoutingProfileId: rpId, // required
    };
    const command = new DescribeRoutingProfileCommand(input);
    const { RoutingProfile } = await client.send(command);
    console.log(JSON.stringify({RoutingProfile}));
    return RoutingProfile;
};