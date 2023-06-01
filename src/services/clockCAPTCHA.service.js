const pool = require("../configs/db.config");

module.exports = {
  searchForToken: (token) => {
    return new Promise((resolve) => {
      pool.query(
        "SELECT * FROM blackList WHERE OTT = ?",
        [token],
        (error, results) => {
          if (error) {
            console.error(error);
            resolve(false);
          } else if (results.length > 0) {
            // Token trovato all' interno del database
            resolve(true);
          } else {
            // Nessuna email nel database
            resolve(false);
          }
        }
      );
    });
  },

  insertToken: (token) => {
    return new Promise((resolve) => {
      pool.query(
        "INSERT INTO blackList(OTT, used) VALUES(?, ?)",
        [token, new Date().toLocaleString([["sv-SE"]])],
        (error, results, fields) => {
          if (error) {
            console.error(error);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  },
};
