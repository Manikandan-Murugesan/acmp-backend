import { ConnectClient, DescribeQueueCommand  } from "@aws-sdk/client-connect";

export const describeQueue = async (srcRegion, srcInstanceId, QueueId) => {
    const client = new ConnectClient({ region: srcRegion });
    const input =  { // DescribeHoursOfOperationRequest
      InstanceId: srcInstanceId, 
      QueueId: QueueId, // requir
    };
    const command = new DescribeQueueCommand (input);
    const { Queue } = await client.send(command);
    console.log(JSON.stringify({Queue}));
    return Queue;
};