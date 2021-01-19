const multer = require('multer');
const { uuid } = require('uuidv4')

const MIME_TYPE_MAP = {    //mime types tell us what te of file we are dealing with and identify extension
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
}

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, 'uploads/images');
        },
        filename: (req, file, cb) =>{
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuid() + '.' + ext);
        }
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];    //!! makes it true/false
        let error = isValid ? null : new Error('Invalid mime type!');
        cb(error, isValid);
    }


});


module.exports = fileUpload;