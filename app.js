const functions = require('./scripts');

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const validator = require('validator');
require('dotenv').config();

const corsOptions = {
  origin: /^http:\/\/localhost(:\d+)?$/
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));


// Configurazione del database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Configurazione del pool di connessioni a MySQL
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


// Connessione al database
connection.connect((err) => {
  if (err) {
    console.error('Errore di connessione al database: ' + err.stack);
    return;
  }
  console.log('Connessione al database riuscita con ID connessione: ' + connection.threadId);

  // Controllo se la tabella 'users' è presente nel database
  connection.query('SELECT 1 FROM users LIMIT 1', functions.checkSecretKey, (error, results, fields) => {
    if (error) {
      console.log('La tabella users non esiste. Creazione della tabella...');

      // Creazione della tabella 'users'
      connection.query(`CREATE TABLE users (
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

      connection.query(`INSERT INTO users(username, email, password) VALUES("mariossi", "mario.rossi@gmmail.com", "Password1234")`, (error, results, fields) => {
        if (error) {
          console.error(error);
          return;
        } 
        console.log('Utente Mario Rossi (mario.rossi@gmmail.com, Mariossi, Password1234) inserito con successo');
      });
    }
  });

  // controllo se la tabella 'applications' è presente nel database
  connection.query('SELECT 1 FROM applications LIMIT 1', (error, results, fields) => {
    if(error) {
      console.log('La tabella applications non esiste. Creazione della tabella...');

      // Creazione della tabella 'applications'
      connection.query(`CREATE TABLE applications (secretKey VARCHAR(255), host VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (secretKey))`, (error, results, fields) => {
        if (error) {
          console.error(error);
         return;
        }
        console.log('La tabella applications è stata creata con successo');
      });

      connection.query(`INSERT INTO applications(secretKey, host, name) VALUES("LQbHd5h334ciuy7", "https://localhost", "WebApp")`, (error, results, fields) => {
        if (error) {
          console.error(error);
          return;
        } 
        console.log('Applicazione WebApp (https://localhost) inserito con successo');
      });
    }
  })
});

function checkSecretKey(req, res, next) {
  const secretKey = req.headers['x-secret-key']; // La secret key è passata nell'header della richiesta HTTP

  // Eseguo una query per verificare se la secret key è presente nel database
  pool.query('SELECT * FROM Applications WHERE key = ?', [secretKey], (error, results, fields) => {
    if (error) {
      // Gestione dell'errore di connessione al database
      return res.status(500).send("Errore interno al server.");
    }

    if (results.length === 0) {
      // La secret key non è presente nel database
      return res.status(403).send("Non autorizzato.");
    }

    // La secret key è presente nel database, passo al middleware successivo
    next();
  });
}

function captchaValidator(req, res, next){
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
app.post('/auth', [checkSecretKey, captchaValidator], (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Controllo se l'username e la password sono presenti nel database
  connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Errore interno del server');
    } else if (results.length > 0) {

      // Se l'utente è autenticato, genero un token di sessione
      const sessionData = {
        email : results[0].email,
        username : results[0].username
      }

      const token = jwt.sign( SessionInfo, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

      res.cookie('tkn', token, { httpOnly: true});
      res.status(200).send('Sessione aperta.');

    } else {
      // Se l'utente non è autenticato, restituisco un errore
      res.status(401).send('Credenziali non valide');
    }
  });
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
app.get('/sessionRecovery', checkSecretKey, (req, res)=>{
    const secretKey = req.headers['x-secret-key'];

    const token = req.cookies.sessionToken;

    //Controllo l'esistenza del cookie
    if(req.cookies && req.cookie.sessionToken){

      try{
        // Recupero i dati della sessione 
        const sessionData = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if(sessionData.expiresAt < new Date()){
          throw new Error('Sessione scaduta.');
        }else{
          //token valido
          const SessionInfo = {
            email : sessionData.email,
            username : sessionData.username
          }

          res.status(200).json(sessionData);
        }
      }catch (err){

        //Distinguo tra token non valido e token scaduto
        if (err instanceof jwt.JsonWebTokenError) {
          //Token non valido
          res.status(401).send('Sessione non valida.');
        } else {
          //Token scaduto
          res.status(401).send('Sessione scaduta.');
        }

      }

    }else{
      res.status(401).send('Sessione non valida.');
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
app.post("/createUser",[checkSecretKey, captchaValidator], (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  //Controllo i dati forniti dall'utente e, se non sono corretti, invio un errore all'utente 
  if(firstName == "" || lastName == "" || username == "" || 
  validator.isEmail(email) == false || passwordValidator(password) == false) {
    res.status(400).send('Credenziali non valide. Riprova.');
    return;
  }

  //Controllo se l'email è già in uso nel database
  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
    if(error) {
      console.error(error);
      res.status(500).send('Errore interno del server');
    } else if (results.length > 0) {
      //Se esiste una riga nel database con l'email scritta scritta dall'utente
      //l'email è già in uso per un diverso account e restituisco un errore
      res.status(400).send('Email in uso.');
    }
  })


});


// Avvio del server
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});

