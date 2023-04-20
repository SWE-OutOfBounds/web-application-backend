require('dotenv').config();
const toolbox = require('./toolbox');

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const validator = require('validator');

const clockCAPTCHA = require('../clock-captcha/dist/index')

const corsOptions = {
  origin: 'http://localhost:43157'
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));



// Configurazione del pool di connessioni a MySQL
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


// Controllo se la tabella 'users' è presente nel database
pool.query('SELECT 1 FROM users LIMIT 1', (error, results, fields) => {
  if (error) {
    console.log('La tabella users non esiste. Creazione della tabella...');

    // Creazione della tabella 'users'
    pool.query(`CREATE TABLE users (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
      )`, (error, results, fields) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('La tabella users è stata creata con successo');
    });

    pool.query(`INSERT INTO users(username, email, password) VALUES("mariossi", "mario.rossi@gmmail.com", "Password1234")`, (error, results, fields) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('Utente Mario Rossi (mario.rossi@gmmail.com, Mariossi, Password1234) inserito con successo');
    });
  }
});

// controllo se la tabella 'applications' è presente nel database
pool.query('SELECT 1 FROM applications LIMIT 1', (error, results, fields) => {
  if (error) {
    console.log('La tabella applications non esiste. Creazione della tabella...');

    // Creazione della tabella 'applications'
    pool.query(`CREATE TABLE applications (secretKey VARCHAR(255), host VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (secretKey))`, (error, results, fields) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('La tabella applications è stata creata con successo');
    });

    pool.query(`INSERT INTO applications(secretKey, host, name) VALUES("LQbHd5h334ciuy7", "https://localhost", "WebApp")`, (error, results, fields) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('Applicazione WebApp (https://localhost) inserito con successo');
    });
  }
})


function checkSecretKey(req, res, next) {
  const secretKey = req.headers['x-secret-key']; // La secret key è passata nell'header della richiesta HTTP

  if (secretKey) {

    // Eseguo una query per verificare se la secret key è presente nel database
    pool.query('SELECT * FROM applications WHERE secretKey = ?', [secretKey], (error, results, fields) => {
      if (error) {
        // Gestione dell'errore di connessione al database
        console.log(error);
        return res.status(500).json({ message: "Database error." });
      }

      if (results.length === 0) {
        // La secret key non è presente nel database
        return res.status(403).json({ message: "Api-key sconosciuta." });
      }

      // La secret key è presente nel database, passo al middleware successivo
      next();
    });

  } else {
    return res.status(403).json({ message: "Api-key richiesta." });
  }

}

function captchaValidator(req, res, next) {
  //TODO
  next();
}

/**
 * @desc Autenticazione dell'utente
 * @route GET /api/products
 * @access Privato
 * @param {string} email - Email dell'utente
 * @param {string} password - Password dell'utente (con hash applicato)
 * @middleware checkSecretKey - Middleware per controllare se l'applicazione è autorizzata
 * @middleware captchaValidator - Middleware per controllare se il captcha è corretto
 * @returns {object} - Uno tra:
 *                      500 - Errore interno al server. 
 *                      200 - Sessione aperta. + cookie con JsonWebToken
 *                      401 - Credenziali non valide.
 *                      403 - Bad CAPTCHA (captchaValidator), 
 *                      403 - Non Autorizzato (checkSecretKey).
 */
app.post('/session', [checkSecretKey, captchaValidator], (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email != "" && password != "" && validator.email(isEmail) && toolbox.passwordValidator(password)) {

    //Controllo se l'username e la password sono presenti nel database
    pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).json({ details: "Database error." });
      } else if (results.length > 0) {

        // Se l'utente è autenticato, genero un token di sessione
        const sessionData = {
          email: results[0].email,
          username: results[0].username
        }

        const token = jwt.sign(SessionInfo, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        //Inserisco il token di sessione nel database
        pool.query('INSERT INTO sessions(IP, opening, token, email) VALUES(?, ?, ?, ?)', [req.socket.remoteAddress, Math.floor(Date.now() / 1000), token, email], (error, result, fields) => {
          if (error) {
            console.error(error);
            res.status(500).json({ details: "Database error." });
          } else {
            //Ritorno il token di sessione
            res.status(200).json({ session_token: token });
          }
        })
      } else {
        // Se l'utente non è registrato, restituisco un errore
        res.status(401).send('Credenziali non valide');
      }
    });

  } else {

    res.status(400).send('Formato errato.');

  }
});

app.delete('/session', [checkSecretKey], (req, res) => {
  const cookies = req.headers.cookie?.split(";");

  if (cookies) {

    var token = "";

    cookies.forEach(element => {
      let array = element.split('=');
      var name = array[0];
      console.log(name);
      if (name == 'sessionToken') {
        let i = 1;
        console.log(array.length);
        while (i < array.length) {
          token += array[i];
          if (i + 1 < array.length) token += "=";
          i++;
        }
      }
    });

    //Controllo l'esistenza del cookie
    if (token != "") {

      // Recupero i dati della sessione 
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (decoded) {

          if (decoded.exp > Math.floor(Date.now() / 1000)) {
            const token = decoded.token;

            pool.query('DELETE FROM sessions WHERE token = ?', [token], (error, results, fields) => {
              if (error) {
                console.error(error);
                res.status(500).json({ details: "Database error." });
              } else if (results.length > 0) {
                res.status(200);
              }
            });

          } else {
            res.status(400).json({ details: 'Token scaduto.' });
          }
        } else {
          res.status(400).json({ details: "Token sconosciuto." });
        }

      });

    } else
      res.status(404).json({ details: 'Token assente.' });

  } else
    res.status(404).json({ details: 'Token assente.' });
});

/**
 * @desc Recupera i dati della sessione
 * @route GET /api/products
 * @access Privato | Check in database
 * @param {string} token - Token di sessione contenuto nei cookie della richiesta
 * @param {string} secret - Chiave segreta dell'applicazione contenuta nell'header della richiesta
 * @middleware checkSecretKey - Middleware per controllare se l'applicazione è autorizzata
 * @returns {object} - Uno tra:
 *                      200 - { Dati di sessione }, 
 *                      401 - Sessione non valida,
 *                      401 - Sessione scaduta,
 *                      403 - Non autorizzato (checkSecretKey).
*/
app.get('/session', [checkSecretKey], (req, res) => {
  const cookies = req.headers.cookie?.split(";");

  if (cookies) {

    var token = "";

    cookies.forEach(element => {
      let array = element.split('=');
      var name = array[0];
      console.log(name);
      if (name == 'sessionToken') {
        let i = 1;
        console.log(array.length);
        while (i < array.length) {
          token += array[i];
          if (i + 1 < array.length) token += "=";
          i++;
        }
      }
    });

    if (token != '') {
      //Token trovato nei cookies

      // Recupero i dati della sessione 
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (decoded) {
          //token generato da questo database

          pool.query("SELECT * FROM sessions WHERE token = ?", [decoded.token], (error, results, fields) => {
            if (error) {
              console.error(error);
              res.status(500).send('Errore interno del server');
            } else if (results.length > 0) {
              //Token in database

              if (res[0].IP == res.socket, remoteAddress) {
                //IP Corrispondente

                if (decoded.exp > Math.floor(Date.now() / 1000)) {
                  //Token ancora valido

                  const sessionData = {
                    email: decoded.email,
                    username: decoded.username
                  }
                  res.status(200).json(sessionData);
                } else {
                  //Token scaduto.

                  res.status(401).json({ details: "Token scaduto." });
                }
              } else {
                //IP non corrispondente a quello che ha aperto la sessione

                res.status(404).json({ details: 'IP sconosciuto.' });
              }
            } else {
              //Token non in database

              res.status(404).json({ details: 'Token assente.' });
            }
          });

        } else {
          //Token non generato da questo backend

          res.status(400).json({ details: "Token sconosciuto." });
        }

      });

    } else {
      //Token non trovato nei cookies

      res.status(404).json({ details: 'Token assente.' });
    }

  } else {
    //Nessun cookie trovato nella richiesta.

    res.status(404).json({ details: 'Token assente.' });
  }
});

/**
 * @desc Crea un utente nel database
 * @route POST /api/createUser
 * @access Privato
 * @param {string} firstName - Nome dell'utente
 * @param {string} lastName - Cognome dell'utente
 * @param {string} username - Nome utente
 * @param {string} email - Email dell utente
 * @param {string} password - Password dell'utente
 * @middleware checkSecretKey - Middleware per controllare se l'applicazione è autorizzata
 * @middleware captchaValidator - Middleware per controllare se il captcha è corretto
 * @returns {object} - Uno tra:
 *                      200 - { Dati di sessione }, 
 *                      400 - Email in uso,
 *                      401 - Formato non valido,
 *                      403 - Non autorizzato (checkSecretKey),
 *                      403 - Bad CAPTCHA (captchaValidator).
 */
app.post("/user", [checkSecretKey, captchaValidator], (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  //Controllo i dati forniti dall'utente e, se non sono corretti, invio un errore all'utente 
  if (firstName == "" || lastName == "" || username == "" || validator.isEmail(email) == false || passwordValidator(password) == false) {
    //Formato dati non corretto

    res.status(400).send('Formato errato.');
  } else {
    //Formato dati corretto

    pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Database error.');
      } else if (results.length > 0) {
        //Email è già in uso per un diverso account e restituisco un errore

        res.status(400).send('Email in uso.');
      } else {
        //Email libera

        pool.query('INSERT INTO users(email, username, nome, cognome, password) VALUES(?, ?, ?, ?, ?)', [email, username, firstName, lastName, password], (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500).send('Database error.');
          } else {
            //Utente inserito nel database

            res.status(201);
          }
        })
      }
    })
  }



});

app.get("/clockCAPTCHA/new", (req, res) => {
  var captchaGenerator = new clockCAPTCHA.ClockCAPTCHAGenerator(process.env.CLOCK_CAPTCHA_PSW);
  res.status(200).json({
    canvas_content: captchaGenerator.getCanvasContent(),
    token: captchaGenerator.getToken()
  })
});

module.exports = app;