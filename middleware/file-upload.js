const multer = require('multer');
const uuid = require('uuidv4')

const MIMTE_TYPE_MAP = {    //mime types tell us what te of file we are dealing with and identify extension
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
}

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) =>{
            const ext = MIMTE_TYPE_MAP[file.mimetype];
            cb(null, uuidv4() + '.' + ext);
        }
    })


});


module.exports = fileUpload;