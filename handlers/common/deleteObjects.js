const region = process.env.Region;

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({ region: region });

const deleteObjects = {
    async deleteObjects(bucketName, key) {
    
        var response = null;
        var output = false;
        try {
                var deleteObjectCommandInput = {};
                deleteObjectCommandInput.Bucket = bucketName;
                deleteObjectCommandInput.Key = key;

                const command = new DeleteObjectCommand(deleteObjectCommandInput);
      		    response = await client.send(command);
                console.log(response);

                output = true;
        } catch (error) {
            console.error(error);
        }
        return output;
    }

}
module.exports = deleteObjects;