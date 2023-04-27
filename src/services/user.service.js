const pool = require('../configs/db.config');

function userService() {
    const create = (username, nome, cognome, email, password) => {
        let connection = mysql.createConnection(db);
        connection.connect((err) => {
            if (err) console.log(err);
            else {
                connection.query('INSERT into')
            }
        })
        connection.end();
    }
    const findByEmail = (email) => {
        
        pool.query('SELECT 1 FROM users WHERE email = ?;', [email], (error, result, fields) => {
            if (error) {
                console.log('Error');
            } else if (result.length > 0) {
                console.log(result.length)
                return true;
            } else return false;
        })
    }

    return {
        create,
        findByEmail,
    };
}

const users = userService();

async function test() {
    let res = users.findByEmail('mario.rossi@gmmail.com');
    console.log(res);
} 

test();
module.exports = userService;

