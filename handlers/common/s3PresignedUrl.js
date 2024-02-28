
const region = process.env.Region;

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({ region: region });

const s3PresignedUrl = {
    async getPresignedUrl(bucketName, objectKey) {
    
        var response = null;
        try {
                var getObjectParams = {};
                getObjectParams.Bucket = bucketName;
                getObjectParams.Key = objectKey;

                const command = new GetObjectCommand(getObjectParams);
                
                const url = await getSignedUrl(client, command, { expiresIn: 3600 });

                console.log(url);
                response = url;
        } catch (error) {
            console.error(error);
        }
        return response;
    }

}
module.exports = s3PresignedUrl;