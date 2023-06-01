const pool = require("../configs/db.config");

// gestione sicurezza password
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  getUsernameByEmail: (email) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (error, results) => {
          if (error) {
            console.error(error);
            resolve("DATABASE_ERROR");
          } else if (results.length > 0) {
            // Email trovata all' interno del database
            resolve(results[0].username);
          } else {
            // Nessuna email nel database
            resolve("EMAIL_NOT_FOUND");
          }
        }
      );
    });
  },

  authenticate: (email, password) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (error, results) => {
          if (error) {
            console.error(error);
            resolve("DATABASE_ERROR");
          } else if (results.length > 0) {
            // Email trovata all' interno del database
            const hashPsw = results[0].password;
            bcrypt.compare(password, hashPsw, function (err, result) {
              if (err) {
                console.error(err);
                resolve("INVALID_DATA");
              } else if (result) {
                resolve("OKAY");
              }
            });
          } else {
            // Nessuna email nel database
            resolve("EMAIL_NOT_FOUND");
          }
        }
      );
    });
  },

  searchForEmail: (email) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "SELECT 1 FROM users WHERE email = ?",
        [email],
        (error, results) => {
          if (error) {
            console.error(error);
            resolve(false);
          } else if (results.length > 0) {
            // Email trovata all' interno del database
            resolve(false);
          } else {
            // Nessuna email nel database
            resolve(true);
          }
        }
      );
    });
  },

  userInsert: (email, username, firstName, lastName, password) => {
    return new Promise((resolve) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          pool.query(
            "INSERT INTO users(email, username, firstname, lastname, password) VALUES(?, ?, ?, ?, ?)",
            [email, username, firstName, lastName, hash],
            (error, results, fields) => {
              if (error) {
                console.error(error);
                resolve(false);
              } else {
                //Utente inserito nel database
                //res.sendStatus(201);
                resolve(true);
              }
            }
          );
        });
      });
    });
  },
};
