const aws = require("aws-sdk");
const sharp = require("sharp");

const s3 = new aws.S3({
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_BUCKET_SECRET_KEY_ID,
  region: process.env.S3_BUCKET_REGION,
});

const questionImageUpload = async (question, user) => {
  const newfileBuffer = sharp(
    `public/files/question/${user.id.split("-").join("")}_questions/${question}`
  );
  const bucket = {
    Bucket: `${process.env.S3_BUCKET_NAME}/questions/${user.id
      .split("-")
      .join("")}_questions`,
    Key: Date.now() + question,
    Body: newfileBuffer,
    ACL: "public-read",
  };
  const newPath = await s3.upload(bucket).promise();
  return newPath.Key;
};
const createFolder = async (folderName) => {
  const bucket = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: folderName,
    Body: "",
    ACL: "public-read",
  };
  const newFolder = await s3.upload(bucket).promise();
  return newFolder.Key;
};
module.exports = {
  questionImageUpload,
  s3,
  createFolder,
};
