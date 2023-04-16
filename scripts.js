/**
 * Controlla se una chiave segreta (secret key) è presente nel database MySQL.
 *
 * @param {*} secret - Chiave segreta da controllare
 */
function passwordValidator(string){
    const regex = /^(?=.?[A-Z])(?=.?[a-z]).{8,}$/i;
    return regex.test(string);
}
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