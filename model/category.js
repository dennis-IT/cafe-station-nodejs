const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    imgPath: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    }
});

const Category = mongoose.model('cafe_station_categories', categorySchema);

module.exports = Category;