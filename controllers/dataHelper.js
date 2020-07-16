//Middlewares to support data processing
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports.imageResizer = (req, res, next) => {
    if (req.file) {
        try {
            let newfile = req.body.itemName.toLowerCase().replace(/ /, '-') + path.extname(req.file.originalname);
            sharp(req.file.path).resize(250, 250).toFile('public/images/' + newfile, (err, resizeImage) => {
                if (err) {
                    console.log(err);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
    next();
};



