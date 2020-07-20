const User = require('../model/user');
const Category = require('../model/category');
const Drink = require('../model/drink');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
    let bestsellers = [];
    let users = await User.find({ email: req.session.userId }).lean();
    let categories = await Category.find().lean();
    let drinks = await Drink.find().lean();

    drinks.forEach(drink => {
        if (drink.bestseller === true) {
            bestsellers.push(drink);
        }
    });

    res.render('home', {
        title: 'Home',
        categories: categories,
        bestsellers: bestsellers,
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : '',
        totalItems: (req.session.cart) ? req.session.cart.length : 0
    });
});

module.exports = router;