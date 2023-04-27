module.exports = {
    create: (req, res) => {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        //Controllo i dati forniti dall'utente e, se non sono corretti, invio un errore all'utente 
        if (firstName == "" || lastName == "" || username == "" || validator.isEmail(email) == false || passwordValidator(password) == false) {
            //Formato dati non corretto

            res.status(400).send('Formato errato.');
        } else {
            //Formato dati corretto

            pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Database error.');
                } else if (results.length > 0) {
                    //Email è già in uso per un diverso account e restituisco un errore

                    res.status(400).send('Email in uso.');
                } else {
                    //Email libera

                    pool.query('INSERT INTO users(email, username, nome, cognome, password) VALUES(?, ?, ?, ?, ?)', [email, username, firstName, lastName, password], (error, results, fields) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send('Database error.');
                        } else {
                            //Utente inserito nel database

                            res.status(201);
                        }
                    })
                }
            })
        }
    }
}