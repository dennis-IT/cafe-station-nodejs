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
        email: (users.length !== 0) ? users[0].email : ''
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
        email: (users.length !== 0) ? users[0].email : ''
    });
});

module.exports = router;