const region = process.env.Region;
const region2=process.env.Region2;

const { ListHoursOfOperationsCommand, ConnectClient } = require("@aws-sdk/client-connect");

const listHop = async (srcInstanceId,srcRegion, condition = false) => {
    const client = new ConnectClient({ region: srcRegion });
    let MasterHopList = [];
    do {
        const input = {
            "InstanceId": srcInstanceId,
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

module.exports = { listHop };