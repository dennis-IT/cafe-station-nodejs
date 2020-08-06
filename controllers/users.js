const serviceAuth = require('./serviceAuth');
const dataHelper = require('./dataHelper');
const User = require('../model/user');
const express = require('express');
const router = express.Router();

router.get('/login', serviceAuth.redirectDashboard, (req, res) => {
    res.render('login', {
        title: 'Login',
        totalItems: (req.session.cart) ? req.session.cart.length : 0
    });
});

router.get('/register', serviceAuth.redirectDashboard, (req, res) => {
    res.render('register', {
        title: 'Register',
        totalItems: (req.session.cart) ? req.session.cart.length : 0
    });
});

router.get('/logout', serviceAuth.verifyLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.redirect('/users/dashboard');
        } else {
            res.clearCookie(process.env.SESSION_NAME);
            res.redirect('/users/login');
        }
    });
});

router.get('/dashboard', serviceAuth.verifyLogin, (req, res) => {
    User.findOne({ email: req.session.userId }).lean().exec()
        .then(user => {
            res.render('dashboard', {
                title: 'Dashboard',
                userId: user.email,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                status: (user.admin) ? 'Data Entry Clerk' : 'Customer',
                isAdmin: user.admin
            });
        })
        .catch(err => {
            res.status(500).send("Unable to display the page correctly");
        });
});

router.get('/cart', serviceAuth.verifyLogin, (req, res) => {
    const items = req.session.cart;
    req.session.carttotal = 0.00;

    if (req.session.cart) {
        req.session.cart.forEach(item => {
            req.session.carttotal += item.itemTotal;
        });
    }

    res.render('shoppingCart', {
        title: 'Shopping Cart',
        items: items,
        cartInTotal: Math.round(req.session.carttotal * 100) / 100
    });
});

router.get('/cart/order-complete', serviceAuth.verifyLogin, (req, res) => {
    if (req.session.cart) {
        dataHelper.cartCheckout(req.session)
            .then(() => {
                req.session.cart = [];
                req.session.carttotal = 0;
                res.redirect('/users/cart');
            })
            .catch(err => {
                console.error(err)
                res.status(500).send('Something broke!')
            });
    } else {
        res.redirect('/users/cart');
    }
});

router.post('/login', serviceAuth.redirectDashboard, (req, res) => {
    const errors = [];
    const { email, password } = req.body;

    if (email == "") {
        errors.push("You must enter an email address");
    }

    if (password == "") {
        errors.push("You must enter a password");
    }

    if (errors.length > 0) {
        res.render('login', {
            title: 'Login',
            errorMessages: errors,
            email: email,
            password: password
        });
    } else {
        serviceAuth.loginUser(req.body)
            .then(user => {
                req.session.userfname = user.fname;
                req.session.userlname = user.lname;
                req.session.userId = user.email;
                req.session.admin = user.admin;
                res.redirect('/users/dashboard');
            })
            .catch(err => {
                res.render('login', {
                    title: 'Login',
                    errorMessages: [err],
                    email: email
                });
            });
    }
});

router.post('/register', serviceAuth.redirectDashboard, (req, res) => {
    const pass_regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    const email_regex = regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const errors = [];
    const { fname, lname, email, password, password2 } = req.body;

    if (fname == "") {
        errors.push("Please fill in your first name");
    }

    if (lname == "") {
        errors.push("Please fill in your last name");
    }

    if (email == "") {
        errors.push("Please fill in your email address");
    }

    if (password == "") {
        errors.push("Please fill in your password");
    }

    if (password !== "" && pass_regex.test(password)) {
        if (password2 == "") {
            errors.push("Please confirm your password");
        }
    }

    //Check email regex
    if (email !== "") {
        if (!email_regex.test(email)) {
            errors.push("Wrong email syntax. Example: user@example.com");
        }
    }

    //Check password regex
    if (password !== "") {
        if (!pass_regex.test(password)) {
            errors.push("Password must contain 6 to 12 characters with letters and numbers only");
        }
    }

    if (errors.length > 0) {
        res.render('register', {
            title: 'Register',
            errorMessages: errors,
            fname: fname,
            lname: lname,
            email: email,
            password: password,
            password2: password2
        });
    } else {
        serviceAuth.registerUser(req.body)
            .then(() => {
                res.render('register', {
                    title: 'Register',
                    successMessage: "User has been created"
                });
            })
            .catch(err => {
                res.render('register', {
                    title: 'Register',
                    errorMessages: [err],
                    fname: fname,
                    lname: lname,
                    email: email,
                    password: password,
                    password2: password2
                });
            });
    }
});

module.exports = router;