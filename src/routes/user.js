const express = require('express');
const router = express.Router();

const user_controller = require("../controllers/user.controller");

/* POST new user */
router.route("/")
    .post(user_controller.create);

module.exports = router;