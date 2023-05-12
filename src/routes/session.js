const express = require("express");
const router = express.Router();

const session_controller = require("../controllers/session.controller");
const clockCaptchaMiddleware = require("../middlewares/clockCaptcha.middleware");

// Definizione delle rotte per il percorso '/'
// La richiesta GET a '/' verrà gestita dalla funzione session_controller.recovery del controller dedicato
// La richiesta POST a '/' verrà gestita dalla sequenza di middleware clockCaptchaMiddleware.validate seguita dalla funzione session_controller.open del controller dedicato
router.route("/").get(session_controller.recovery);
router
  .route("/")
  .post(clockCaptchaMiddleware.validate, session_controller.open);

module.exports = router;
