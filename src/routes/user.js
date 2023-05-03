const express = require('express');
const router = express.Router();

const clockCaptchaMiddleware = require('../middlewares/clockCaptcha.middleware');
const user_controller = require("../controllers/user.controller");

/* POST new user */
router.route("/").post(clockCaptchaMiddleware.validate,user_controller.create);

module.exports = router;