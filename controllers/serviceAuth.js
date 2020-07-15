//Middlewares to authenticate user session
const User = require('../model/user');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports.verifyLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    } else {
        next();
    }
};

module.exports.verifyAdmin = (req, res, next) => {
    if (!req.session.admin) {
        res.send('You do not have permission to view this page');
    } else {
        next();
    }
};

module.exports.redirectDashboard = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/users/dashboard');
    } else {
        next();
    }
};

module.exports.loginUser = userData => {
    return new Promise((resolve, reject) => {
        User.find({ email: userData.email })
            .exec()
            .then(users => {
                if (users.length == 0) {
                    reject(`Unable to find user: ${userData.email}`);
                } else {
                    bcrypt.compare(userData.password, users[0].password)
                        .then(found => {
                            if (found) {
                                resolve(users[0]);
                            } else {
                                reject(`Incorrect password`);
                            }
                        });
                }
            })
            .catch(err => {
                reject(`Unable to find user: ${userData.email}`);
            });
    });
};

module.exports.registerUser = userData => {
    return new Promise((resolve, reject) => {
        User.find({ email: userData.email })
            .exec()
            .then(users => {
                if (users.length != 0) {
                    reject(`This email address ${userData.email} has been registered`);
                } else {
                    if (userData.password !== userData.password2) {
                        reject("Passwords do not match");
                    } else {
                        bcrypt.genSalt(10, (err, salt) => {
                            if (err) {
                                reject("There was an error encrypting the password");
                            } else {
                                bcrypt.hash(userData.password, salt, (err, hash) => {
                                    if (err) {
                                        reject("There was an error encrypting the password");
                                    } else {
                                        userData.password = hash;
                                        const user = new User({
                                            fname: userData.fname,
                                            lname: userData.lname,
                                            email: userData.email,
                                            password: userData.password
                                        });

                                        user.save()
                                            .then(user => {
                                                const sgMail = require('@sendgrid/mail');
                                                sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
                                                const msg = {
                                                    to: `${user.email}`,
                                                    from: 'cafe.express.to@gmail.com',
                                                    subject: 'Welcome to Café Station',
                                                    html: `Hello ${user.fname}, thank you for registering with us! <br> 
                                                Your Name: ${user.fname} ${user.lname} <br>
                                                Your Email: ${user.email}`
                                                };

                                                sgMail.send(msg)
                                                    .then(() => {
                                                        resolve();
                                                    })
                                                    .catch(err => {
                                                        reject("There was an error sending confirmation email");
                                                    });
                                            })
                                            .catch(err => {
                                                reject("There was an error creating the user: " + err);
                                            });
                                    }
                                });
                            }
                        });
                    }
                }
            });
    });
};

