const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemQty: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    linePrice: {
        type: Number,
        required: true
    }
});

const Order = mongoose.model('cafe_station_orders', orderSchema);

module.exports = Order;