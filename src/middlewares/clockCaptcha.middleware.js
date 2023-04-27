const jwt = require('jsonwebtoken');
const pool = require('../configs/db.config');
const clockCAPTCHA = require('../../../clock-captcha/dist/index');

module.exports = {
    validate: (req, res) => {
        var token = req.body.cc_token;
        var user_input = req.body.cc_input;

        if (token && user_input) {
            //token e input utente ben formati
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (decoded) {
                    //Token ok
                    if (decoded.exp > Math.floor(Date.now() / 1000)) {
                        //Token ancora valido
                        token = decoded.cc_token;
                        pool.getConnection((error, connection) => {
                            connection.query("SELECT * FROM BlackList WHERE OTT = ?", [token], (error, results, fields) => {
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
                                    console.log('non in blacklist')
                                    connection.query("INSERT INTO BlackList(OTT, timestamp) VALUES(?, ?)", [token, new Date().toLocaleString([['sv-SE']])], (error, results, fields) => {
                                        connection.release();
                                        if (error) {
                                            console.error(error);
                                            return res.status(500).json({ details: "DB_ERROR" });
                                        } else if (clockCAPTCHA.ClockCAPTCHAGenerator.verifyUserInput(token, process.env.CLOCK_CAPTCHA_PSW, user_input)) {
                                            //captcha risolto con successo
                                            console.log("Captcha risolto con successo");
                                            res.sendStatus(200);
                                        } else {
                                            //captcha risolto in modo errato
                                            return res.status(400).json({ details: "BAD_CAPTCHA" });
                                        }
                                    })
                                }
                            });
                        });
                    } else {
                        return res.status(400).json({ details: "EXPIRED_TOKEN" })
                    }
                } else {
                    //Token non generato da questo backen
                    return res.status(400).json({ details: "INVALID_TOKEN" });
                }

            });

        } else {
            return res.status(404).json({ details: "MISSING_DATA" })
        }
    }
}