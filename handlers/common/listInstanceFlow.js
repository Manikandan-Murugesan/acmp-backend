const region = process.env.AWS_REGION;

const { ConnectClient, ListInstancesCommand } = require("@aws-sdk/client-connect");
const client = new ConnectClient({ region: region });

const listInstanceFlow = {
    async listInstanceFlow(NextToken="") {
        try {
            console.log("Inside the list instance function")
            var response = null;
            const input = { 
            };
            if(!!NextToken) input.NextToken = NextToken;
            
            console.log("Input--",input)
            
            const command = new ListInstancesCommand(input);
            console.log("Command--",command)
            response = await client.send(command);
            console.log("response",response)
        } catch (error) {
            console.error(error)
        }
        return response;
    }
}
module.exports = listInstanceFlow;