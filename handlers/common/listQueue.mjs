import { ListQueuesCommand , ConnectClient } from "@aws-sdk/client-connect";

export const listQueueOp = async (parsedBody) => {
     let condition = false
    const client = new ConnectClient({ region: parsedBody.srcRegion });
    let MasterQueueList = [];
    do {
        const input = {
            "InstanceId": parsedBody.srcInstanceId,
            "QueueTypes":[parsedBody.QueueTypes],
            ...(condition && { NextToken })
        };
        const command = new ListQueuesCommand(input);
        const { QueueSummaryList, NextToken } = await client.send(command);
        condition = !!NextToken;
        MasterQueueList = [...MasterQueueList, ...QueueSummaryList];
    } while (condition);
    console.log(JSON.stringify({MasterQueueList}));
    return MasterQueueList;
};