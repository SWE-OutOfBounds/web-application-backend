const pool = require('../configs/db.config');
const validator = require('validator');
const toolbox = require('../utils/toolbox');
const jwt = require('jsonwebtoken');

// gestione sicurezza password
const bcrypt = require('bcrypt');

module.exports = {
    open: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        
        
        if (email && password && email != "" && password != "" && validator.isEmail(email) && toolbox.passwordValidator(password)) {
            //Controllo se l'utente è registrato verificando se l'email è presente nel database
            pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ details: "DATABASE_ERROR" });
                } else if (results.length > 0) {
                    //l'email è stata trovata nel DB, controllo che la password fornita sia corretta
                    const hashPsw = results[0].password; 
                    bcrypt.compare(password, hashPsw, function(err,result){
                        if(err){
                            console.error(err);
                            res.status(400).json({ details: "INVALID_DATA" }); 
                        }
                        else if (result){
                            //credenziali fornite sono corrette
                            
                            // Se l'utente è autenticato, genero un token di sessione
                            const sessionData = {
                            email: results[0].email,
                            username: results[0].username
                            }

                            const token = jwt.sign(sessionData, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                            res.status(200).json({ session_token: token });
                        } else {
                            // password non corretta restituisco l'errore generico
                            res.status(401).json({ details: 'BAD_CREDENTIAL' });
                            }
                    })
                } else {
                    // Se l'utente non è registrato, restituisco l'errore generico
                    res.status(401).json({ details: 'BAD_CREDENTIAL' });
                }
            });

        } else {
            if (!email || !validator.isEmail(email)){
                res.status(400).json({ details: 'INVALID_EMAIL_FORMAT' });
            }
            else
                res.status(400).json({ details: 'INVALID_PASSWORD_FORMAT' });
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

                
                try{
                    let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                    res.status(200).json({email:decoded.email, username: decoded.username});
                }catch(error){
                    if(error.name == "JsonWebTokenError") res.status(400).json({details : "INVALID_TOKEN"});
                    if(error.name == "TokenExpiredError") res.status(400).json({details : "EXPIRED_TOKEN"});
                }

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