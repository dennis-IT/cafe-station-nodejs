const mongoose = require('mongoose');

const drinkSchema = new mongoose.Schema({
    imgPath: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    bestseller: {
        type: Boolean,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const Drink = mongoose.model('cafe_station_drinks', drinkSchema);

module.exports = Drink;