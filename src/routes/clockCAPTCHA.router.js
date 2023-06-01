const express = require("express");
const router = express.Router();

const cc_controller = require("../controllers/clockCAPTCHA.controller");

// Definizione della rotta GET '/'
// La richiesta a questa rotta verrà gestita dal controller cc_controller.generate
router.get("/", cc_controller.generate);

module.exports = router;
