const pool = require('../configs/db.config');

module.exports = {
    checkSecretKey: (req, res, next) => {
        // Ottengo la secret key dall'header della richiesta HTTP
        let secretKey = req.headers['x-secret-key'];

        if (secretKey) {
            // Eseguo una query per verificare se la secret key è presente nel database
            pool.getConnection((err, connection) => {
                connection.query('SELECT * FROM apikeys WHERE secretKey = ?', [secretKey], (error, results, fields) => {
                    connection.release();
                    if (error) {
                        // Gestione dell'errore di connessione al database
                        console.log(error);
                        res.status(500).json({ details: "DATABASE_ERROR" });

                    } else if (results.length === 0)
                        // La secret key non è presente nel database
                        res.status(403).json({ details: "INVALID_API_KEY" });

                    else
                        // La secret key è presente nel database, passo al middleware successivo
                        next();
                });
            });
        } else {
            res.status(403).json({ details: "API_KEY_REQUIRED" });
        }
    }
}