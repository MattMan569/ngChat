import aws from 'aws-sdk';

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error('Environment variable AWS_ACCESS_KEY is undefined');
}
if (!process.env.AWS_SECRET_KEY) {
  throw new Error('Environment variable AWS_SECRET_KEY is undefined');
}

export const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

export default s3;
