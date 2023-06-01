const express = require("express");
const router = express.Router();

const clockCaptchaMiddleware = require("../middlewares/clockCaptcha.middleware");
const user_controller = require("../controllers/user.controller");

// Definizione della rotta POST per il percorso '/'
// La richiesta a questa rotta verrà gestita dalla sequenza di middleware clockCaptchaMiddleware.validate seguita dalla funzione user_controller.create
router.route("/").post(clockCaptchaMiddleware.validate, user_controller.create);

module.exports = router;
