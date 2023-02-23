const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const app = express();

// Configurazione del database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Password',
  database: 'PoCBackEnd'
});

// Connessione al database
connection.connect((error) => {
  if (error) {
    console.error('Errore di connessione al database: ' + error.stack);
    return;
  }
  console.log('Connessione al database effettuata con successo');
});


// API RESTful per ottenere tutti i dati dalla tabella "users"
app.get('/users', (req, res) => {
  console.log(req);
  const query = 'SELECT * FROM users';
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// Avvio del server
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
