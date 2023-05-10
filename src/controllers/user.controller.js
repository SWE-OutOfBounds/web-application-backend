const validator = require('validator');
const toolbox = require('../utils/toolbox');
const pool = require('../configs/db.config');


module.exports = {
    create: (req, res) => {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        //Controllo i dati forniti dall'utente e, se non sono corretti, invio un errore all'utente 
        if(!firstName || !lastName || !username || !email || !password){
            //UPGRADABLE : Indicate missing data's names on res.body.details
            res.status(400).json({ details: 'MISSING_DATA' });
        }else if (firstName == "" || lastName == "" || username == "" || !validator.isEmail(email) || !toolbox.passwordValidator(password)) {
            //Formato dati non corretto
            if (firstName == "") res.status(400).json({ details: "INVALID_FIRSTNAME_FORMAT" });
            else if (lastName == "") res.status(400).json({ details: "INVALID_LASTNAME_FORMAT" });
            else if (username == "") res.status(400).json({ details: "INVALID_USERNAME_FORMAT" });
            else if (!validator.isEmail(email)) res.status(400).json({ details: "INVALID_EMAIL_FORMAT" });
            else res.status(400).json({ details: 'INVALID_PASSWORD_FORMAT' });
        } else {
            //Formato dati corretto

            pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ details: "DATABASE_ERROR" });
                } else if (results.length > 0) {
                    //Email è già in uso per un diverso account e restituisco un errore

                    res.status(400).json({details:'USED_EMAIL'});
                } else {
                    //Email libera

                    pool.query('INSERT INTO users(email, username, firstname, lastname, password) VALUES(?, ?, ?, ?, ?)', [email, username, firstName, lastName, password], (error, results, fields) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json({details:'DATABASE_ERROR'});
                        } else {
                            //Utente inserito nel database
                            res.sendStatus(201);
                        }
                    })
                }
            })
        }
    }
}