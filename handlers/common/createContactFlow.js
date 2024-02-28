const region = process.env.AWS_REGION;

const { ConnectClient, UpdateContactFlowContentCommand, CreateContactFlowCommand  } = require( "@aws-sdk/client-connect");
//const client = new ConnectClient({ region: region });

const createContactFlow = {
    async updateContactFlow (input,destRegion) {
      console.log("Inside update flow")
      const client = new ConnectClient({ region: destRegion });
        const command = new UpdateContactFlowContentCommand(input);
        let flowOutput
          try {
            console.log("Inside try", command)
            flowOutput = await client.send(command); 
        } catch (error) {
            flowOutput = error
        }
        console.log("flowOutput", flowOutput)
        return flowOutput;
    },
    async createContactFlow (input,destRegion) {
        console.log("Inside create flow")
        console.log("Region",destRegion)
        const client = new ConnectClient({ region: destRegion });
        const command = new CreateContactFlowCommand(input);
        let flowOutput
           try {
            console.log("Inside try", command)
            flowOutput = await client.send(command); 
        } catch (error) {
            flowOutput = error
        }
        console.log("flowOutput", flowOutput)
        return flowOutput;
    }
};

module.exports = createContactFlow;