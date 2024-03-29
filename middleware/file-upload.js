const multer = require("multer");
const { uuid } = require("uuidv4");

const MIME_TYPE_MAP = {
  //mime types tell us what te of file we are dealing with and identify extension
  "image/png": "PNG",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    /*destination: (req, file, cb) => { //Since we are storing files in Amzaon bucket, we should not set a destination
      cb(null, "uploads/images");
    },*/
    filename: (req, file, cb) => {
      //Making sure each file has a unique id
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    //filtering file types - only accepting images
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; //!! makes it true/false
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
