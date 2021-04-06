const fs = require("fs");
const HttpError = require("../models/http-error");
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
    if (error) {
      const error = new HttpError(
        "Failed to upload to amazon bucket, try again later"
      );
    }
  });
};

exports.AWSUpload = AWSUpload;
