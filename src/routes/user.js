const express = require('express');
const router = express.Router();

const user_controller = require("../controllers/user.controller");
const clockCaptchaMiddleware = require('../middlewares/clockCaptcha.middleware');

/* POST new user */
router.route("/").post(clockCaptchaMiddleware.validate,user_controller.create);

module.exports = router;