const fs = require("fs");
var aws = require("aws-sdk");
const s3 = new aws.S3();

const AWSUpload = (req) => {
  const fileStream = fs.createReadStream(req.file.path);
  const params = {
    ACL: "public-read",
    Bucket: process.env.S3_BUCKET,
    Key: req.file.filename,
    Body: fileStream,
  };

  s3.upload(params, function (error, data) {
    console.log(error, data);
  });
};

exports.AWSUpload = AWSUpload;
