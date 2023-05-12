const jwt = require("jsonwebtoken");
const pool = require("../configs/db.config");
const cc = require("../../../clock-captcha/dist/index");

module.exports = {
  validate: (req, res, next) => {
    // Ottenimento del token e dell'input utente dalla richiesta
    var token = req.body.cc_token;
    var user_input = req.body.cc_input;

    if (token && user_input) {
      //token e input utente ben formati
      try {
        // Verifica del token utilizzando la chiave segreta
        let decoded_token = jwt.verify(token, process.env.JWT_SECRET_KEY).token;

        // Ottenimento di una connessione dal pool del database
        pool.getConnection((error, connection) => {
          // Controllo se il token è presente nella blacklist
          connection.query(
            "SELECT * FROM blackList WHERE OTT = ?",
            [decoded_token],
            (error, results, fields) => {
              if (error) {
                connection.release();
                console.error(error);
                return res.status(500).json({ details: "DB_ERROR" });
              } else if (results.length > 0) {
                // Il token è presente nella blacklist
                connection.release();
                return res.status(400).json({ details: "USED_TOKEN" });
              } else {
                // Il token non è presente nella blacklist
                // Aggiunta del token alla blacklist
                connection.query(
                  "INSERT INTO blackList(OTT, used) VALUES(?, ?)",
                  [decoded_token, new Date().toLocaleString([["sv-SE"]])],
                  (error, results, fields) => {
                    connection.release();
                    if (error) {
                      console.error(error);
                      return res.status(500).json({ details: "DB_ERROR" });
                    } else if (
                      cc.ClockCAPTCHA.validateData(
                        { token: decoded_token, input: user_input },
                        process.env.CLOCK_CAPTCHA_PSW
                      )
                    ) {
                      // Il captcha è stato risolto correttamente
                      next();
                    } else {
                      // Il captcha è stato risolto in modo errato
                      return res.status(400).json({ details: "BAD_CAPTCHA" });
                    }
                  }
                );
              }
            }
          );
        });
      } catch (error) {
        //Gestione degli errori di JWT
        if (error.name == "JsonWebTokenError")
          res.status(400).json({ details: "INVALID_TOKEN" });
        if (error.name == "TokenExpiredError")
          res.status(400).json({ details: "EXPIRED_TOKEN" });
      }
    } else {
      // Dati mancanti nella richiesta
      return res.status(404).json({ details: "MISSING_DATA" });
    }
  },
};
