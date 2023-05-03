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
        if (firstName == "" || lastName == "" || username == "" || !validator.isEmail(email) || !toolbox.passwordValidator(password)) {
            //Formato dati non corretto
            if (firstName == "") res.status(400).json({ details: "INVALID_FORMAT_FIRSTNAME" });
            else if (lastName == "") res.status(400).json({ details: "INVALID_FORMAT_LASTNAME" });
            else if (username == "") res.status(400).json({ details: "INVALID_FORMAT_USERNAME" });
            else if (!validator.isEmail(email)) res.status(400).json({ details: "INVALID_FORMAT_EMAIL" });
            else res.status(400).json({ details: 'INVALID_FORMAT_PASSWORD' });
        } else {
            //Formato dati corretto

            pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Database error.');
                } else if (results.length > 0) {
                    //Email è già in uso per un diverso account e restituisco un errore

                    res.status(400).send('USED_EMAIL');
                } else {
                    //Email libera

                    pool.query('INSERT INTO users(email, username, firstname, lastname, password) VALUES(?, ?, ?, ?, ?)', [email, username, firstName, lastName, password], (error, results, fields) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send('DATABASE_ERROR');
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