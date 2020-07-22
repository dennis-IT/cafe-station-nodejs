const serviceAuth = require('./serviceAuth');
const User = require('../model/user');
const Category = require('../model/category');
const Drink = require('../model/drink');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/menu/all');
});

router.get('/:category', async (req, res) => {
    let users = await User.find({ email: req.session.userId }).lean();
    let categories = await Category.find().lean();
    let drinks = await Drink.find().lean();

    let categories_sort = [{ name: 'all' }];
    let drinks_sort = [];

    categories.forEach(category => categories_sort.push(category));

    if (req.params.category === 'all') {
        drinks_sort = drinks;
    } else {
        drinks.forEach(drink => {
            if (drink.category === req.params.category) {
                drinks_sort.push(drink);
            }
        });
    }

    res.render('menu', {
        title: req.params.category.toUpperCase(),
        category: req.params.category.toUpperCase(),
        categories: categories,
        categories_sort: categories_sort,
        drinks: drinks_sort,
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : '',
        totalItems: (req.session.cart) ? req.session.cart.length : 0
    });
});

router.get('/:category/:id', async (req, res) => {
    let users = await User.find({ email: req.session.userId }).lean();
    let drinks = await Drink.find().lean();
    let result = drinks.filter(drink => drink.url === req.params.id);

    res.render('item', {
        title: result[0].name,
        drinks: result,
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : '',
        totalItems: (req.session.cart) ? req.session.cart.length : 0
    });
});

router.post('/:category/:id', serviceAuth.verifyLogin, async (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    let users = await User.find({ email: req.session.userId }).lean();
    let drinks = await Drink.find().lean();
    let result = drinks.filter(drink => drink.url === req.params.id);
    const errors = [];
    const { itemName, itemCat, itemUrl, itemQty, itemPrice, itemImg } = req.body;

    if (itemQty == 0 || !/^\d+$/.test(itemQty)) {
        errors.push('Invalid quantity number');
    }

    if (errors.length > 0) {
        res.render('item', {
            title: itemName,
            errorMessages: errors,
            title: result[0].name,
            drinks: result,
            userId: (users.length !== 0) ? users[0].email : req.session.userId,
            email: (users.length !== 0) ? users[0].email : '',
            totalItems: (req.session.cart) ? req.session.cart.length : 0
        });
    } else {
        const newItem = {
            itemName: itemName,
            itemCat: itemCat,
            itemUrl: itemUrl,
            itemQty: parseInt(itemQty),
            itemPrice: parseFloat(itemPrice),
            itemImg: itemImg,
            itemTotal: Math.round((parseInt(itemQty) * parseFloat(itemPrice)) * 100) / 100
        };

        if (req.session.cart) {
            let flag = false;
            for (let i = 0; i < req.session.cart.length && !flag; i++) {
                if (req.session.cart[i].itemName === itemName) {
                    req.session.cart[i].itemQty += parseInt(itemQty);
                    req.session.cart[i].itemTotal = Math.round((req.session.cart[i].itemQty * req.session.cart[i].itemPrice) * 100) / 100
                    flag = true;
                }
            }

            if (!flag) {
                req.session.cart.push(newItem);
            }
        } else {
            req.session.cart = [newItem];
        }

        res.render('item', {
            title: itemName,
            title: result[0].name,
            drinks: result,
            userId: (users.length !== 0) ? users[0].email : req.session.userId,
            email: (users.length !== 0) ? users[0].email : '',
            totalItems: (req.session.cart) ? req.session.cart.length : 0
        });
    }
});

module.exports = router;