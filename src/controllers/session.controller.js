const pool = require('../configs/db.config');
const validator = require('validator');
const toolbox = require('../utils/toolbox');
const jwt = require('jsonwebtoken');

module.exports = {
    open: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        console.log(email);
        console.log(password);
        console.log(validator.isEmail(email));
        console.log(toolbox.passwordValidator(password));

        if (email != "" && password != "" && validator.isEmail(email) && toolbox.passwordValidator(password)) {

            //Controllo se l'username e la password sono presenti nel database
            pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ details: "DATABASE_ERROR" });
                } else if (results.length > 0) {

                    // Se l'utente è autenticato, genero un token di sessione
                    const sessionData = {
                        email: results[0].email,
                        username: results[0].username
                    }

                    const token = jwt.sign(sessionData, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                    res.status(200).json({ session_token: token });
                } else {
                    // Se l'utente non è registrato, restituisco un errore
                    res.status(401).json({ details: 'BAD_CREDENTIAL' });
                }
            });

        } else {
            if (validator.isEmail(email))
                res.status(400).json({ details: 'INVALID_EMAIL_FORMAT' });
            else
                res.status(400).json({ details: 'INVALID_PASSWORD_DATA' });
        }
    },
    recovery: (req, res) => {
        const cookies = req.headers.cookie?.split(";");

        if (cookies) {

            var token = "";

            cookies.forEach(element => {
                let array = element.split('=');
                var name = array[0];
                if (name == 'sessionToken') {
                    let i = 1;
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
                        sessionData = {
                            email : decoded.email,
                            username : decoded.username
                        }
                        res.status(200).json(sessionData);
                    } else {
                        //Token non generato da questo backend

                        res.status(400).json({ details: "INVALID_TOKEN" });
                    }

                });

            } else {
                //Token non trovato nei cookies

                res.status(404).json({ details: 'MISSING_COOKIE' });
            }

        } else {
            //Nessun cookie trovato nella richiesta.

            res.status(404).json({ details: 'MISSING_COOKIE' });
        }
    }
}