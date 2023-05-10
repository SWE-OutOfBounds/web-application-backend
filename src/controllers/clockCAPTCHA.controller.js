const cc = require('../../../clock-captcha/dist/index');
const jwt = require('jsonwebtoken');
const pool = require('../configs/db.config');

module.exports = {
    generate: (req, res) => {
        var generationStrategy = new cc.ShapesDecorator(new cc.NoiseDecorator(new cc.HTMLCanvasGenerator(), 0),8);
        var ImageGenerator = new cc.ClockImageGenerator(generationStrategy);
        var cc_data = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, ImageGenerator);
        var resPayload= {
            token: jwt.sign(cc_data.token, process.env.JWT_SECRET_KEY),
            image: cc_data.image
        }
        res.status(200).json(resPayload);
    }
}