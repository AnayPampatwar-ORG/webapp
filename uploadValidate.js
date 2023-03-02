
const multer = require('multer');
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    }  
    else{
        const error = new Error('Invalid file type, only JPEG, PNG and JPG is allowed!');
        error.status = 400;
        cb(error, false);

    }
} 
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


module.exports = upload 