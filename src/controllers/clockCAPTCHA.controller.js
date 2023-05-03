const clockCAPTCHA = require('../../../clock-captcha/dist/index');
const jwt = require('jsonwebtoken');
const pool = require('../configs/db.config');

module.exports = {
    generate: (req, res) => {
        var captchaGenerator = new clockCAPTCHA.NoiseDecorator(new clockCAPTCHA.ShapesDecorator(new clockCAPTCHA.ClockCAPTCHAGenerator(process.env.CLOCK_CAPTCHA_PSW), 4), 30);
        res.status(200).json({
            canvas_content: captchaGenerator.getImage(),
            token: jwt.sign({ cc_token: captchaGenerator.getToken() }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
        })
    },
    validate: (req, res) => {
        res.sendStatus(200);
    }
}