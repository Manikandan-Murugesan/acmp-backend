const region = process.env.AWS_REGION;

const { ConnectClient, UpdateContactFlowContentCommand, UpdateContactFlowModuleContentCommand ,CreateContactFlowModuleCommand  } = require( "@aws-sdk/client-connect");
//const client = new ConnectClient({ region: region });

const createContactModule = {
    async updateContactModule (input,destRegion) {
        console.log("Inside update module", input)
        console.log("Region is",destRegion)
	const client = new ConnectClient({ region: destRegion });
        let flowOutput;
        const command = new UpdateContactFlowModuleContentCommand(input);
        try {
            console.log("Inside try", command)
            flowOutput = await client.send(command); 
        } catch (error) {
            flowOutput = error
        }
        console.log("flowOutput", flowOutput)
        return flowOutput;
    },
    async createContactModule (input,destRegion) {
        console.log("Inside create module",destRegion)
	const client = new ConnectClient({ region: destRegion });
        const command = new CreateContactFlowModuleCommand(input);
        const flowOutput = await client.send(command); 
        console.log("Flow ouput",flowOutput)
        return flowOutput;
    }
};

module.exports = createContactModule;