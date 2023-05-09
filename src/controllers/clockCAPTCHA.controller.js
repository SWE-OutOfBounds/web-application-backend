const cc = require('../../../clock-captcha/dist/index');
const jwt = require('jsonwebtoken');
const pool = require('../configs/db.config');

module.exports = {
    generate: (req, res) => {
        var generationStrategy = new cc.ShapesDecorator(new cc.NoiseDecorator(new cc.HTMLCanvasGenerator(), 25),8);
        var ImageGenerator = new cc.ClockImageGenerator(generationStrategy);
        var toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, ImageGenerator);
        res.status(200).json(toSendData);
    }
}