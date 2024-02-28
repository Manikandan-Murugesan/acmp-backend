const region = process.env.Region;

const { S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({ region: region });

const listObjects = {
    async getBucketObjects(bucketName, prefix) {
    
        var response = null;
        try {
                var ListObjectsCommandRequest = {};
                ListObjectsCommandRequest.Bucket = bucketName;
                if(prefix){
                    ListObjectsCommandRequest.Prefix = prefix;
                }
  		  	    const command = new ListObjectsCommand(ListObjectsCommandRequest);
      		    response = await client.send(command);
                console.log(response);
        } catch (error) {
            console.error(error);
        }
        return response;
    }

}
module.exports = listObjects;