import { ListRoutingProfileQueuesCommand, ConnectClient } from "@aws-sdk/client-connect";

export const describeRpQueue = async (srcRegion, srcInstanceId,rpId, condition = false) => {
    const client = new ConnectClient({ region: srcRegion });
    let MasterRpQueueList = [];
    do {
        const input = {
            "InstanceId": srcInstanceId,
            "RoutingProfileId": rpId,
            ...(condition && { NextToken })
        };
        const command = new ListRoutingProfileQueuesCommand(input);
        const { RoutingProfileQueueConfigSummaryList, NextToken } = await client.send(command);
        condition = !!NextToken;
        MasterRpQueueList = [...MasterRpQueueList, ...RoutingProfileQueueConfigSummaryList];
    } while (condition);
    console.log(JSON.stringify({MasterRpQueueList}));
    return MasterRpQueueList;
};