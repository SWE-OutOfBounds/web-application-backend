const validator = require("validator");
const toolbox = require("../utils/toolbox");
const jwt = require("jsonwebtoken");

const userService = require("../services/user.service");

module.exports = {
  open: async (req, res) => {
    // Ottenimento dell'email e della password dalla richiesta
    const email = req.body.email;
    const password = req.body.password;

    // Verifica se l'email e la password sono presenti, non vuote e nel formato corretto
    if (
      email &&
      password &&
      email != "" &&
      password != "" &&
      validator.isEmail(email) &&
      toolbox.passwordValidator(password)
    ) {
      //Controllo se l'utente è registrato verificando se l'email è presente nel database
      // pool.query(
      //   "SELECT * FROM users WHERE email = ?",
      //   [email],
      //   (error, results) => {
      //     if (error) {
      //       console.error(error);
      //       res.status(500).json({ details: "DATABASE_ERROR" });
      //     } else
      const authResult = await userService.authenticate(email, password);
      switch (authResult) {
        case "DATABASE_ERROR":
          res.status(500).json({ details: "DATABASE_ERROR" });
          break;

        case "EMAIL_NOT_FOUND":
        case "BAD_CREDENTIAL":
          res.status(401).json({ details: "BAD_CREDENTIAL" });
          break;

        case "OKAY":
          const username = await userService.getUsernameByEmail(email);
          // Genero un token di sessione
          const sessionData = {
            email: email,
            username: username,
          };

          const token = jwt.sign(
            sessionData,
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" } // 1h = 3600 sec
          );

          res.status(200).json({
            username: username,
            session_token: token,
            expiredIn: 3600,
          });
          break;

        case "INVALID_DATA":
          res.status(400).json({ details: "INVALID_DATA" });
          break;

        default:
          res.status(500).json({ details: "GENERIC_ERROR" });
          break;
      }
    } else {
      // Se l'email non è presente o non è nel formato corretto
      if (!email || !validator.isEmail(email)) {
        res.status(400).json({ details: "INVALID_EMAIL_FORMAT" });
      } else {
        // Se la password non è presente o non è nel formato corretto
        res.status(400).json({ details: "INVALID_PASSWORD_FORMAT" });
      }
    }
  },
  recovery: (req, res) => {
    // Ottenimento dei cookies dall'header della richiesta
    const cookies = req.headers.cookie?.split(";");

    if (cookies) {
      var token = "";

      // Scansione dei cookies per trovare il token di sessione
      cookies.forEach((element) => {
        let array = element.split("=");
        var name = array[0];
        if (name == "sessionToken") {
          let i = 1;
          while (i < array.length) {
            token += array[i];
            if (i + 1 < array.length) token += "=";
            i++;
          }
        }
      });

      if (token != "") {
        //Token trovato nei cookies

        try {
          // Verifica e decodifica il token di sessione
          let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
          res
            .status(200)
            .json({ email: decoded.email, username: decoded.username });
        } catch (error) {
          // Gestione degli errori di token
          if (error.name == "JsonWebTokenError")
            res.status(400).json({ details: "INVALID_TOKEN" });
          if (error.name == "TokenExpiredError")
            res.status(400).json({ details: "EXPIRED_TOKEN" });
        }
      } else {
        //Token non trovato nei cookies
        res.status(404).json({ details: "MISSING_COOKIE" });
      }
    } else {
      //Nessun cookie trovato nella richiesta.
      res.status(404).json({ details: "MISSING_COOKIE" });
    }
  },
};
