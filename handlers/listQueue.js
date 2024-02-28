import { corSetting } from './common/constants.mjs';
import { performMigrateHop } from "./performMigrateHop.mjs";
import { performMigrateQueue } from "./performMigrateQueue.mjs";
import { performMigrateRp } from "./performMigrateRp.mjs";
import { performMigrateQc } from "./performMigrateQc.mjs";
import {listQueueOp} from "./common/listQueue.mjs";
import {listHopOp} from "./common/listHop.mjs";
import {listRPOp} from "./common/listRp.mjs";
import {listQCOp} from "./common/listQc.mjs";

export const listQueue = async (event, context) => {
    console.log(JSON.stringify({ event }));
    const response = {};
     response.headers = corSetting;
    if (event.httpMethod !== 'POST') {
        response.statusCode = 415;
        response.headers = corSetting;
        response.body = JSON.stringify({ error: `Resource API only accepts POST method, you tried: ${event.httpMethod} method.` });
    } else {
        // to be built

        const parsedBody = JSON.parse(event.body);
        const command = parsedBody.command;
        console.log(JSON.stringify({ command }));

        switch (command) {
            case "MIGRATE_HOP":
                const result = await performMigrateHop(parsedBody);
                response.body = JSON.stringify({result});
                break;
                
            // For queues Queue Types input is needed in the body like array
            case "MIGRATE_QUEUE":
                const Queueresult = await performMigrateQueue(parsedBody);
                response.body = JSON.stringify({Queueresult});
                break;
            
            case "MIGRATE_ROUTINGPROFILE":
                const rpresult = await performMigrateRp(parsedBody);
                response.body = JSON.stringify({rpresult});
                break;
                
                
            // For QC QuickConnectTypes in Array is needed    
            case "MIGRATE_QUICKCONNECTS":
                const qcresult = await performMigrateQc(parsedBody);
                response.body = JSON.stringify({qcresult});
                break;
                
            case "ListQueue":
                console.log("Inside list queue", parsedBody);
                parsedBody.QueueTypes = "STANDARD"
                const listQueueResult = await listQueueOp(parsedBody);
                response.body = JSON.stringify({listQueueResult})
                break;
            
            case "ListHop":
                console.log("Inside list Hop", parsedBody);
                const listHopResult = await listHopOp(parsedBody);
                response.body = JSON.stringify({listHopResult})
                break;
                
            case "ListRP":
                console.log("Inside list RP", parsedBody);
                const listRPResult = await listRPOp(parsedBody);
                response.body = JSON.stringify({listRPResult})
                break;
                
            case "ListQC":
                // parsedBody.QuickConnectTypes = "PHONE_NUMBER"
                console.log("Inside list QC", parsedBody);
                const listQCResult = await listQCOp(parsedBody);
                response.body = JSON.stringify({listQCResult})
                break;
                
            default:
                response.statusCode = 422;
                response.headers = corSetting;
                response.body = JSON.stringify({ error: `The command : "${command}" is not valid.` });
                break;
        }
    }
    console.log(JSON.stringify({ response }));
    return response;
};