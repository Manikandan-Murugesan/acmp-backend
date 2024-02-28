import { ListHoursOfOperationsCommand, ConnectClient } from "@aws-sdk/client-connect";

export const listHopOp = async (parsedBody) => {
     let condition = false
    const client = new ConnectClient({ region: parsedBody.srcRegion });
    let MasterHopList = [];
    do {
        const input = {
            "InstanceId": parsedBody.srcInstanceId,
            ...(condition && { NextToken })
        };
        const command = new ListHoursOfOperationsCommand(input);
        const { HoursOfOperationSummaryList, NextToken } = await client.send(command);
        condition = !!NextToken;
        MasterHopList = [...MasterHopList, ...HoursOfOperationSummaryList];
    } while (condition);
    console.log(JSON.stringify({MasterHopList}));
    return MasterHopList;
};