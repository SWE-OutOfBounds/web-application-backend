require('dotenv').config();
const mysql = require('mysql');

// Configurazione dei dettagli di connessione al database utilizzando le variabili d'ambiente
const db = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Crea il pool di connessione al database MySQL utilizzando i dettagli configurati
const pool = mysql.createPool(db)

// Esporta il pool di connessione per consentire l'uso in altri moduli
module.exports = pool;