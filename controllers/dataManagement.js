const serviceAuth = require('./serviceAuth');
const dataHelper = require('./dataHelper');
const User = require('../model/user');
const Category = require('../model/category');
const Drink = require('../model/drink');
const multer = require("multer");
const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const storage = multer.diskStorage({
    destination: "./public/images/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return cb(null, false);
        }
        cb(null, true);
    }
});

router.get('/category', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    dataHelper.getAllCategories()
        .then(categories => {
            res.render('manageCategory', {
                title: 'Category',
                categories: categories
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.get('/drink', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    dataHelper.getAllDrinks()
        .then(drinks => {
            res.render('manageDrink', {
                title: 'Drink',
                drinks: drinks
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.get('/category/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    res.render('addCategory', {
        title: 'Category'
    });
});

router.get('/drink/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    dataHelper.getAllCategories()
        .then(categories => {
            res.render('addDrink', {
                title: 'Drink',
                categories: categories
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.post('/category/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, upload.single("imageFile"), dataHelper.imageResizer, (req, res) => {
    const errors = [];
    const { itemName } = req.body;

    if (itemName == "") {
        errors.push("Please fill in category name");
    }

    if (!req.file) {
        errors.push("No file received or invalid image file type");
    }

    if (errors.length > 0) {
        res.render('addCategory', {
            title: 'Category',
            errorMessages: errors,
            catName: itemName
        });
    } else {
        Category.find({ name: itemName })
            .exec()
            .then(cat => {
                if (cat.length != 0) {
                    errors.push("This category has been already in the database");
                    res.render('addCategory', {
                        title: 'Category',
                        errorMessages: errors,
                        catName: itemName,
                        catImage: req.file.originalname
                    });
                } else {
                    const category = new Category({
                        imgPath: itemName.toLowerCase().replace(/ /g, '-') + path.extname(req.file.originalname),
                        name: itemName.toLowerCase()
                    });

                    category.save()
                        .then(() => {
                            res.redirect('/manage/category');
                        })
                        .catch(err => {
                            res.render('addCategory', {
                                title: 'Category',
                                errorMessages: [err],
                                catName: itemName,
                                catImage: req.file.originalname
                            });
                        });
                }
            });
    }
});

router.post('/drink/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, upload.single("imageFile"), dataHelper.imageResizer, (req, res) => {
    let topdrink;
    let unhide = false;
    const errors = [];
    const { itemName, drinkPrice, drinkDesc, drinkCat, drinkBest } = req.body;

    dataHelper.getAllCategories()
        .then(categories => {
            if (itemName == "" || drinkPrice == "" || drinkDesc == "" || drinkCat == "" || drinkBest == "") {
                errors.push("Please fill in all fields");
            }

            if (!req.file) {
                errors.push("No file received or invalid image file type");
            }

            for (let i = 0; i < categories.length; i++) {
                if (categories[i].name == drinkCat) {
                    categories[i].selected = true;
                }
            }

            if (drinkBest !== '') {
                if (drinkBest === "true") {
                    topdrink = true;
                    unhide = true;
                } else {
                    topdrink = false;
                    unhide = true;
                }
            }

            if (errors.length > 0) {
                res.render('addDrink', {
                    title: 'Drink',
                    errorMessages: errors,
                    categories: categories,
                    topdrink: topdrink,
                    drinkName: itemName,
                    drinkPrice: drinkPrice,
                    drinkDesc: drinkDesc,
                    drinkCat: drinkCat,
                    drinkBest: drinkBest,
                    unhide: unhide
                });
            } else {
                const drink = new Drink({
                    name: itemName,
                    imgPath: itemName.toLowerCase().replace(/ /g, '-') + path.extname(req.file.originalname),
                    description: drinkDesc,
                    category: drinkCat,
                    price: drinkPrice,
                    bestseller: drinkBest,
                    url: itemName.toLowerCase().replace(/ /g, '-')
                });

                drink.save()
                    .then(() => {
                        res.redirect('/manage/drink');
                    })
                    .catch(err => {
                        res.render('addDrink', {
                            title: 'Drink',
                            errorMessages: [err],
                            categories: categories,
                            topdrink: topdrink,
                            drinkName: itemName,
                            drinkPrice: drinkPrice,
                            drinkDesc: drinkDesc,
                            drinkCat: drinkCat,
                            drinkBest: drinkBest,
                            unhide: unhide,
                            drinkImage: req.file.originalname
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.get('/category/delete/:category', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    Category.deleteOne({ name: req.params.category })
        .then(() => {
            Drink.deleteOne({ category: req.params.category })
                .then(() => {
                    res.redirect('/manage/category');
                })
                .catch(err => {
                    res.status(500).send("Unable to delete drink(s) in the category");
                });
        })
        .catch(err => {
            res.status(500).send("Unable to delete category");
        });
});

router.get('/drink/delete/:drink', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    Drink.deleteOne({ url: req.params.drink })
        .then(() => {
            res.redirect('/manage/drink');
        })
        .catch(err => {
            res.status(500).send("Unable to delete drink");
        });
});

router.get('/drink/update/:drink', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    let drink;
    let categories = [];
    Drink.findOne({ url: req.params.drink }).lean().exec()
        .then(data => {
            drink = data;
        })
        .catch(err => {
            console.error(err);
        })
        .then(dataHelper.getAllCategories)
        .then(data => {
            categories = data;
            categories.forEach(category => {
                if (category.name === drink.category) {
                    category.selected = true;
                }
            })
        })
        .catch(err => {
            console.error(err);
        })
        .then(() => {
            res.render('updateDrink', {
                title: 'Drink',
                categories: categories,
                topdrink: drink.bestseller,
                drinkName: drink.name,
                drinkPrice: drink.price,
                drinkDesc: drink.description,
                drinkCat: drink.category,
                drinkBest: drink.bestseller,
                drinkImage: drink.imgPath,
                drinkId: drink._id
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.post('/drink/update', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, upload.single("imageFile"), dataHelper.imageResizer, (req, res) => {
    let topdrink;
    let unhide = false;
    const errors = [];
    const { itemName, drinkPrice, drinkDesc, drinkCat, drinkBest, drinkId, drinkImage } = req.body;

    dataHelper.getAllCategories()
        .then(categories => {
            if (itemName == "" || drinkPrice == "" || drinkDesc == "" || drinkCat == "" || drinkBest == "") {
                errors.push("Please fill in all fields");
            }

            for (let i = 0; i < categories.length; i++) {
                if (categories[i].name == drinkCat) {
                    categories[i].selected = true;
                }
            }

            if (drinkBest !== '') {
                if (drinkBest === "true") {
                    topdrink = true;
                    unhide = true;
                } else {
                    topdrink = false;
                    unhide = true;
                }
            }

            if (errors.length > 0) {
                res.render('updateDrink', {
                    title: 'Update Drink',
                    errorMessages: errors,
                    categories: categories,
                    topdrink: topdrink,
                    drinkName: itemName,
                    drinkPrice: drinkPrice,
                    drinkDesc: drinkDesc,
                    drinkCat: drinkCat,
                    drinkBest: drinkBest,
                    drinkId: drinkId,
                    drinkImage: drinkImage,
                    unhide: unhide
                });
            } else {
                let drink = {
                    name: itemName,
                    description: drinkDesc,
                    category: drinkCat,
                    price: drinkPrice,
                    bestseller: drinkBest,
                    url: itemName.toLowerCase().replace(/ /g, '-')
                }

                if (req.file) {
                    drink.imgPath = itemName.toLowerCase().replace(/ /g, '-') + path.extname(req.file.originalname);
                }

                Drink.findByIdAndUpdate(drinkId, drink).then(() => {
                    res.redirect('/manage/drink');
                }).catch(err => {
                    res.render('manageDrink', {
                        title: 'Update Drink',
                        errorMessages: [err],
                        categories: categories,
                        topdrink: topdrink,
                        drinkName: itemName,
                        drinkPrice: drinkPrice,
                        drinkDesc: drinkDesc,
                        drinkCat: drinkCat,
                        drinkBest: drinkBest,
                        drinkId: drinkId,
                        drinkImage: drinkImage,
                        unhide: unhide
                    });
                });
            }
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.get('/cart/delete/:drinkUrl', serviceAuth.verifyLogin, (req, res) => {
    let found = false;
    for (let i = 0; i < req.session.cart.length && !found; i++) {
        if (req.session.cart[i].itemUrl === req.params.drinkUrl) {
            req.session.cart.splice(i, 1);
            found = true;
        }
    }

    res.redirect('/users/cart');
});

router.get('/cart/decrease/:drinkUrl', serviceAuth.verifyLogin, (req, res) => {
    let found = false;
    for (let i = 0; i < req.session.cart.length && !found; i++) {
        if (req.session.cart[i].itemUrl === req.params.drinkUrl) {
            if (req.session.cart[i].itemQty > 1) {
                req.session.cart[i].itemQty--;
                req.session.cart[i].itemTotal = Math.round((req.session.cart[i].itemQty * req.session.cart[i].itemPrice) * 100) / 100
            }
            found = true;
        }
    }
    res.redirect('/users/cart');
});

router.get('/cart/increase/:drinkUrl', serviceAuth.verifyLogin, (req, res) => {
    let found = false;
    for (let i = 0; i < req.session.cart.length && !found; i++) {
        if (req.session.cart[i].itemUrl === req.params.drinkUrl) {
            req.session.cart[i].itemQty++;
            req.session.cart[i].itemTotal = Math.round((req.session.cart[i].itemQty * req.session.cart[i].itemPrice) * 100) / 100
            found = true;
        }
    }
    res.redirect('/users/cart');
});

module.exports = router;