const express = require('express');
const router = express.Router();

const session_controller = require("../controllers/session.controller");
const clockCaptchaMiddleware = require('../middlewares/clockCaptcha.middleware')

router.route('/').get(clockCaptchaMiddleware.validate,session_controller.recovery)
router.post('/',session_controller.open)
router.delete('/',session_controller.close)
    
module.exports = router;