const jwt = require('jsonwebtoken');
const pool = require('../configs/db.config');
const cc = require('../../../clock-captcha/dist/index');

module.exports = {
    validate: (req, res, next) => {
        var token = req.body.cc_token;
        var user_input = req.body.cc_input;

        if (token && user_input) {
            //token e input utente ben formati
            try {
                let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                token = decoded.cc_token;
                pool.getConnection((error, connection) => {
                    connection.query("SELECT * FROM blackList WHERE OTT = ?", [token], (error, results, fields) => {
                        if (error) {
                            connection.release();
                            console.error(error);
                            return res.status(500).json({ details: "DB_ERROR" });
                        } else if (results.length > 0) {
                            //token in black list
                            connection.release();
                            return res.status(400).json({ details: "USED_TOKEN" })
                        } else {
                            //token non in blacklist
                            connection.query("INSERT INTO blackList(OTT, used) VALUES(?, ?)", [token, new Date().toLocaleString([['sv-SE']])], (error, results, fields) => {
                                connection.release();
                                if (error) {
                                    console.error(error);
                                    return res.status(500).json({ details: "DB_ERROR" });
                                } else if (cc.ClockCAPTCHA.validateData({token:token, input: user_input}, process.env.CLOCK_CAPTCHA_PSW)) {
                                    //captcha risolto con successo
                                    next();
                                } else {
                                    //captcha risolto in modo errato
                                    return res.status(400).json({ details: "BAD_CAPTCHA" });
                                }
                            })
                        }
                    });
                });
            } catch (error) {
                if (error.name == "JsonWebTokenError") res.status(400).json({ details: "INVALID_TOKEN" });
                if (error.name == "TokenExpiredError") res.status(400).json({ details: "EXPIRED_TOKEN" });
            }
        } else {
            return res.status(404).json({ details: "MISSING_DATA" })
        }
    }
}