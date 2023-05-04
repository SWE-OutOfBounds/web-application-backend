const express = require('express');
const router = express.Router();

const clockCaptchaMiddleware = require('../middlewares/clockCaptcha.middleware');

const cc_controller = require("../controllers/clockCAPTCHA.controller");

router.get('/',cc_controller.generate);
    
module.exports = router;