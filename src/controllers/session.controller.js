const pool = require('../configs/db.config');
module.exports = {
    open: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        if (email != "" && password != "" && validator.email(isEmail) && toolbox.passwordValidator(password)) {

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

                    //Inserisco il token di sessione nel database
                    pool.query('INSERT INTO sessions(IP, opening, token, email) VALUES(?, ?, ?, ?)', [req.socket.remoteAddress, Math.floor(Date.now() / 1000), token, email], (error, result, fields) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json({ details: "DATABASE_ERROR" });
                        } else {
                            //Ritorno il token di sessione
                            res.status(200).json({ session_token: token });
                        }
                    })
                } else {
                    // Se l'utente non è registrato, restituisco un errore
                    res.status(401).send('BAD_CREDENTIAL');
                }
            });

        } else {

            res.status(400).send('INVALID_DATA');

        }
    },

    close: (req, res) => {
        const cookies = req.headers.cookie?.split(";");

        if (cookies) {

            var token = "";

            cookies.forEach(element => {
                let array = element.split('=');
                var name = array[0];
                console.log(name);
                if (name == 'sessionToken') {
                    let i = 1;
                    console.log(array.length);
                    while (i < array.length) {
                        token += array[i];
                        if (i + 1 < array.length) token += "=";
                        i++;
                    }
                }
            });

            //Controllo l'esistenza del cookie
            if (token != "") {

                // Recupero i dati della sessione 
                jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                    if (decoded) {

                        if (decoded.exp > Math.floor(Date.now() / 1000)) {
                            const token = decoded.token;

                            pool.query('DELETE FROM sessions WHERE token = ?', [token], (error, results, fields) => {
                                if (error) {
                                    console.error(error);
                                    res.status(500).json({ details: "DATABASE_ERROR" });
                                } else if (results.length > 0) {
                                    res.status(200);
                                }
                            });

                        } else {
                            console.error("test");
                            res.status(400).json({ details: 'EXPIRED_TOKEN' });
                        }
                    } else {
                        res.status(400).json({ details: "INVALID_TOKEN" });
                    }

                });

            } else
                res.status(404).json({ details: 'MISSING_TOKEN' });

        } else
            res.status(404).json({ details: 'MISSING_TOKEN' });
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

                        pool.query("SELECT * FROM sessions WHERE token = ?", [decoded.token], (error, results, fields) => {
                            if (error) {
                                console.error(error);
                                res.status(500).send('DATABASE_ERROR');
                            } else if (results.length > 0) {
                                //Token in database

                                if (res[0].IP == res.socket, remoteAddress) {
                                    //IP Corrispondente

                                    if (decoded.exp > Math.floor(Date.now() / 1000)) {
                                        //Token ancora valido

                                        const sessionData = {
                                            email: decoded.email,
                                            username: decoded.username
                                        }
                                        res.status(200).json(sessionData);
                                    } else {
                                        //Token scaduto.

                                        res.status(401).json({ details: "EXPIRED_TOKEN" });
                                    }
                                } else {
                                    //IP non corrispondente a quello che ha aperto la sessione

                                    res.status(404).json({ details: 'INVALID_IP' });
                                }
                            } else {
                                //Token non in database

                                res.status(404).json({ details: 'MISSING_TOKEN' });
                            }
                        });

                    } else {
                        //Token non generato da questo backend

                        res.status(400).json({ details: "INVALID_TOKEN" });
                    }

                });

            } else {
                //Token non trovato nei cookies

                res.status(404).json({ details: 'MISSING_TOKEN' });
            }

        } else {
            //Nessun cookie trovato nella richiesta.

            res.status(404).json({ details: 'MISSING_TOKEN' });
        }
    }
}