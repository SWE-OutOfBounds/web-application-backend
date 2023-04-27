const pool = require('../configs/db.config');

module.exports = {
    checkSecretKey: (req, res, next) => {
        let secretKey = req.headers['x-secret-key']; // La secret key è passata nell'header della richiesta HTTP

        if (secretKey) {
            // Eseguo una query per verificare se la secret key è presente nel database
            return pool.getConnection((err, connection) => {
                connection.query('SELECT * FROM applications WHERE secretKey = ?', [secretKey], (error, results, fields) => {
                    connection.release();
                    if (error) {
                        // Gestione dell'errore di connessione al database
                        console.log(error);
                        return res.status(500).json({ details: "DATABASE_ERROR" });

                    } else if (results.length === 0)
                        // La secret key non è presente nel database
                        return res.status(403).json({ details: "INVALID_API_KEY" });

                    else
                        // La secret key è presente nel database, passo al middleware successivo
                        next();
                });
            });
        } else {
            return res.status(403).json({ details: "API_KEY_REQUIRED" });
        }
    }
}