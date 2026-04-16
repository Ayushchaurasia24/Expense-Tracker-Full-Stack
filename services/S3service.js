const AWS = require("aws-sdk");

exports.uploadToS3 = (data, filename) => {
  const s3bucket = new AWS.S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
    region: "ap-south-1" // IMPORTANT
  });

const params = {
  Bucket: process.env.S3_BUCKET_NAME,
  Key: filename,
  Body: data,
  ContentType: "text/plain",
  ContentDisposition: "attachment"
};
  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.error("S3 ERROR:", err);
        reject(err);
      } else {
        resolve(s3response.Location);
      }
    });
  });
};
