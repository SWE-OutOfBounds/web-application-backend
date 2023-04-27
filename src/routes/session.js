const express = require('express');
const router = express.Router();

const session_controller = require("../controllers/session.controller");

router.get('/session',session_controller.recovery)
router.post('/session',session_controller.recovery)
router.delete('/session',session_controller.recovery)
    
module.exports = router;