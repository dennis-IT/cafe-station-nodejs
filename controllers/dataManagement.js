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

router.get('/category', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, async (req, res) => {
    let users = await User.find({ email: req.session.userId }).lean();
    let categories = await Category.find().lean();

    res.render('manageCategory', {
        title: 'Category',
        categories: categories,
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : ''
    });
});

router.get('/drink', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, async (req, res) => {
    let users = await User.find({ email: req.session.userId }).lean();
    let drinks = await Drink.find().lean();

    res.render('manageDrink', {
        title: 'Drink',
        drinks: drinks,
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : ''
    });
});

router.get('/category/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, async (req, res) => {
    let users = await User.find({ email: req.session.userId }).lean();

    res.render('addCategory', {
        title: 'Category',
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : ''
    });
});

router.get('/drink/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, async (req, res) => {
    let users = await User.find({ email: req.session.userId }).lean();
    let categories = await Category.find().lean();

    res.render('addDrink', {
        title: 'Drink',
        categories: categories,
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : ''
    });
});

router.post('/category/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, upload.single("imageFile"), dataHelper.imageResizer, async (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    let users = await User.find({ email: req.session.userId }).lean();
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
            catName: itemName,
            userId: (users.length !== 0) ? users[0].email : req.session.userId,
            email: (users.length !== 0) ? users[0].email : ''
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
                        catImage: req.file.originalname,
                        userId: (users.length !== 0) ? users[0].email : req.session.userId,
                        email: (users.length !== 0) ? users[0].email : ''
                    });
                } else {
                    const category = new Category({
                        imgPath: itemName.toLowerCase().replace(/ /, '-') + path.extname(req.file.originalname),
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
                                catImage: req.file.originalname,
                                userId: (users.length !== 0) ? users[0].email : req.session.userId,
                                email: (users.length !== 0) ? users[0].email : ''
                            });
                        });
                }
            });
    }
});

router.post('/drink/add', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, upload.single("imageFile"), dataHelper.imageResizer, async (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    let users = await User.find({ email: req.session.userId }).lean();
    let categories = await Category.find().lean();
    let topdrink;
    const errors = [];
    const { itemName, drinkPrice, drinkDesc, drinkCat, drinkBest } = req.body;

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

    if (drinkBest === "true") {
        topdrink = true;
    } else {
        topdrink = false;
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
            userId: (users.length !== 0) ? users[0].email : req.session.userId,
            email: (users.length !== 0) ? users[0].email : ''
        });
    } else {
        const drink = new Drink({
            name: itemName,
            imgPath: itemName.toLowerCase().replace(/ /, '-') + path.extname(req.file.originalname),
            description: drinkDesc,
            category: drinkCat,
            price: drinkPrice,
            bestseller: drinkBest,
            url: itemName.toLowerCase().replace(/ /, '-')
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
                    drinkImage: req.file.originalname,
                    userId: (users.length !== 0) ? users[0].email : req.session.userId,
                    email: (users.length !== 0) ? users[0].email : ''
                });
            });
    }
});

router.get('/category/delete/:category', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    Category.deleteOne({ name: req.params.category })
        .then(() => {
            Drink.deleteOne({ category: req.params.category })
                .then(() => {
                    res.redirect('/manage/category');
                })
                .catch(err => {
                    console.log('There is error when delete');
                });
        })
        .catch(err => {
            console.log('There is error when delete');
        });
});

router.get('/drink/delete/:drink', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, (req, res) => {
    Drink.deleteOne({ url: req.params.drink })
        .then(() => {
            res.redirect('/manage/drink');
        })
        .catch(err => {
            console.log('There is error when delete');
        });
});

router.get('/drink/update/:drink', serviceAuth.verifyLogin, serviceAuth.verifyAdmin, async (req, res) => {
    let users = await User.find({ email: req.session.userId }).lean();
    let drink = await Drink.findOne({ url: req.params.drink }).lean();
    let categories = await Category.find().lean();

    categories.forEach(category => {
        if (category.name === drink.category) {
            category.selected = true;
        }
    })

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
        userId: (users.length !== 0) ? users[0].email : req.session.userId,
        email: (users.length !== 0) ? users[0].email : ''
    });
});

module.exports = router;