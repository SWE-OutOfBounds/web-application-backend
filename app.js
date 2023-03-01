const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
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

// Connessione al database
connection.connect((err) => {
  if (err) {
    console.error('Errore di connessione al database: ' + err.stack);
    return;
  }
  console.log('Connessione al database riuscita con ID connessione: ' + connection.threadId);
  
  // Controllo se la tabella 'users' è presente nel database
  connection.query('SELECT 1 FROM users LIMIT 1', (error, results, fields) => {
    if (error) {
      console.error(error);
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
});

// Autenticazione
app.post('/auth', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Controllo se l'username e la password sono presenti nel database
  connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Errore interno del server');
    } else if (results.length > 0) {
      // Se l'utente è autenticato, genero un token di accesso
      const token = jwt.sign({ email: email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ token: token, email: results[0].email, userName: results[0].username });
    } else {
      // Se l'utente non è autenticato, restituisco un errore
      res.status(401).send('Credenziali non valide');
    }
  });

});


// Avvio del server
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
}); 
