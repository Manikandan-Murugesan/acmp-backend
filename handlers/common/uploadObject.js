const region = process.env.Region;

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({ region: region });

const uploadObject = {
    async uploadFile(bucketName, s3ObjectPath, fileresponse) {
    
        var response = null;
        var output = false;
        try {
                var putObjectCommand = {};
                putObjectCommand.Bucket = bucketName;
                putObjectCommand.Key = s3ObjectPath;
                putObjectCommand.Body = fileresponse;
                console.log("Put object command",putObjectCommand)

                const command = new PutObjectCommand(putObjectCommand );
                console.log("Command-out",command)
      		    response = await client.send(command);
                console.log("response --",response);

                output = true;
        } catch (error) {
            console.error(error);
        }
        return output;
    }

}
module.exports = uploadObject;