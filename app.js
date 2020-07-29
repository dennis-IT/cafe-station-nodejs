const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const multer = require("multer");
const session = require('express-session');
const mongoose = require('mongoose');

require('dotenv').config({ path: './config/keys.env' });
const app = express();


const HTTP_PORT = process.env.PORT;
const IN_PROD = process.env.NODE_ENV === 'production';

const db = process.env.MONGO_URI;
mongoose.connect(db, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log('Connected to mongoDB'))
    .catch(err => console.log(err));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.set('trust proxy', 1);
app.use(session({
    name: process.env.SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_KEY,
    cookie: {
        maxAge: Number(process.env.SESSION_LIFETIME),
        sameSite: true,
        secure: IN_PROD
    }
}));

// custom middleware to add "session" to all views (res)
app.use(function (req, res, next) {
    res.locals.session = req.session;
    res.locals.session.totalNumItems = (req.session.cart) ? req.session.cart.length : 0;
    next();
});

//Route handlers
app.use('/', require('./controllers/home'));
app.use('/menu', require('./controllers/menu'));
app.use('/users', require('./controllers/users'));
app.use('/manage', require('./controllers/dataManagement'));

app.listen(HTTP_PORT, () => {
    console.log(`Webserver is up and running on port ${HTTP_PORT}...`);
});

