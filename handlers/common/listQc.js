const region = process.env.Region;


const { ListQuickConnectsCommand, ConnectClient } = require("@aws-sdk/client-connect") ;

const listQCOp = async (instanceId, QuickConnectTypes,srcRegion) => {
    const client = new ConnectClient({ region: srcRegion });
        const input = {
            "InstanceId": instanceId,
            "QuickConnectTypes":[QuickConnectTypes],
        };
        const command = new ListQuickConnectsCommand(input);
        const resp = await client.send(command);
    console.log(JSON.stringify({resp}));
    return resp;
};

module.exports = { listQCOp }
