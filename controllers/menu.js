const serviceAuth = require('./serviceAuth');
const dataHelper = require('./dataHelper');
const User = require('../model/user');
const Category = require('../model/category');
const Drink = require('../model/drink');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/menu/all');
});

router.get('/:category', (req, res) => {
    let categories = [];
    let categories_sort = [{ name: 'all' }];
    let drinks_sort = [];

    dataHelper.getAllCategories()
        .then(data => {
            categories = data;
            categories.forEach(category => categories_sort.push(category));
        })
        .catch(err => {
            console.error(err);
        })
        .then(dataHelper.getAllDrinks)
        .then(drinks => {
            if (req.params.category === 'all') {
                drinks_sort = drinks;
            } else {
                drinks.forEach(drink => {
                    if (drink.category === req.params.category) {
                        drinks_sort.push(drink);
                    }
                });
            }
        })
        .catch(err => {
            console.error(err);
        })
        .then(() => {
            res.render('menu', {
                title: req.params.category.toUpperCase(),
                category: req.params.category.toUpperCase(),
                categories: categories,
                categories_sort: categories_sort,
                drinks: drinks_sort
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.get('/:category/:id', (req, res) => {
    let drinks = [];

    dataHelper.getAllDrinks()
        .then(drinks => {
            let result = drinks.filter(drink => drink.url === req.params.id);
            res.render('item', {
                title: result[0].name,
                drinks: result
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.post('/:category/:id', serviceAuth.verifyLogin, (req, res) => {
    let drinks = [];
    let result;
    const errors = [];
    const { itemName, itemCat, itemUrl, itemQty, itemPrice, itemImg } = req.body;

    dataHelper.getAllDrinks()
        .then(drinks => {
            result = drinks.filter(drink => drink.url === req.params.id);

            if (itemQty == 0 || !/^\d+$/.test(itemQty)) {
                errors.push('Invalid quantity number');
            }

            if (errors.length > 0) {
                res.render('item', {
                    title: itemName,
                    errorMessages: errors,
                    title: result[0].name,
                    drinks: result
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
                res.redirect(`/menu/${req.params.category}/${req.params.id}`);
            }
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

module.exports = router;