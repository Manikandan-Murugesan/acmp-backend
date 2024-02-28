const region = process.env.Region;

const { ListRoutingProfilesCommand, ConnectClient } = require("@aws-sdk/client-connect");

const listRPOp = async (InstanceId,srcRegion,NextToken="") => {
    let  condition = false;
    const client = new ConnectClient({ region: srcRegion });
    let MasterRpList = [];
    do {
        const input = {
            "InstanceId": InstanceId,
            ...(condition && { NextToken })
        };
       const command = new ListRoutingProfilesCommand(input);
        const { RoutingProfileSummaryList, NextToken } = await client.send(command);
        condition = !!NextToken;
        MasterRpList = [...MasterRpList, ...RoutingProfileSummaryList];
    } while (condition);
    console.log(JSON.stringify({MasterRpList}));
    return MasterRpList;
};
module.exports = {listRPOp}