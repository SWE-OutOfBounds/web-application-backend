require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = {};

const keyCheckMiddleware = require('./src/middlewares/keycheck.middleware')

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use(express.json());

app.use(keyCheckMiddleware.checkSecretKey);

app.use('/users', require('./src/routes/user'));
app.use('/session', require('./src/routes/session'));
app.use('/clock-captcha', require('./src/routes/clockCAPTCHA'));

module.exports = app;