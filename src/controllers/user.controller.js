const validator = require("validator");
const toolbox = require("../utils/toolbox");

const userService = require("../services/user.service");

module.exports = {
  create: async (req, res) => {
    // Ottenimento dei dati forniti dall'utente dalla richiesta
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    //Controllo i dati forniti dall'utente e, se non sono corretti, invio un errore all'utente
    if (!firstName || !lastName || !username || !email || !password) {
      //UPGRADE : Indicare nel messaggio di risposta quale campo dati è assente.
      res.status(400).json({ details: "MISSING_DATA" });
    } else if (
      firstName == "" ||
      lastName == "" ||
      username == "" ||
      !validator.isEmail(email) ||
      !toolbox.passwordValidator(password)
    ) {
      //Formato dati non corretto
      if (firstName == "")
        res.status(400).json({ details: "INVALID_FIRSTNAME_FORMAT" });
      else if (lastName == "")
        res.status(400).json({ details: "INVALID_LASTNAME_FORMAT" });
      else if (username == "")
        res.status(400).json({ details: "INVALID_USERNAME_FORMAT" });
      else if (!validator.isEmail(email))
        res.status(400).json({ details: "INVALID_EMAIL_FORMAT" });
      else res.status(400).json({ details: "INVALID_PASSWORD_FORMAT" });
    } else {
      //Formato dati corretto per cui verifico se l'email è già in uso
      const freeEmail = await userService.searchForEmail(email);
      console.log(freeEmail);
      if (freeEmail) {
        const insertResult = await userService.userInsert(
          email,
          username,
          firstName,
          lastName,
          password
        );
        if (insertResult) {
          res.status(201).json({ details: "CREATED" });
        } else {
          res.status(500).json({ details: "DATABASE_ERROR" });
        }
      } else {
        res.status(400).json({ details: "USED_EMAIL" });
      }
    }
  },
};
