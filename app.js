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

//Connect to mongodb
const db = process.env.MONGO_URI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to mongoDB'))
    .catch(err => console.log(err));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

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

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

//Route handlers
app.use('/', require('./controllers/home'));
app.use('/menu', require('./controllers/menu'));
app.use('/users', require('./controllers/users'));
app.use('/manage', require('./controllers/dataManagement'));

app.listen(HTTP_PORT, () => {
    console.log(`Webserver is up and running on port ${HTTP_PORT}...`);
});

