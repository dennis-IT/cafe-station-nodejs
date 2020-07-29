const User = require('../model/user');
const Category = require('../model/category');
const Drink = require('../model/drink');
const dataHelper = require('./dataHelper');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
    let bestsellers = [];
    let categories = [];
    let drinks = [];

    dataHelper.getAllCategories()
        .then(data => {
            categories = data;
        })
        .catch(err => {
            console.error(err);
        })
        .then(dataHelper.getAllDrinks)
        .then(data => {
            drinks = data;
            drinks.forEach(drink => {
                if (drink.bestseller === true) {
                    bestsellers.push(drink);
                }
            });
        })
        .catch(err => {
            console.error(err);
        })
        .then(() => {
            res.render('home', {
                title: 'Home',
                categories: categories,
                bestsellers: bestsellers
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

module.exports = router;