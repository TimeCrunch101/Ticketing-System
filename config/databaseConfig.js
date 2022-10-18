module.exports = function() {
    require('dotenv').config();
    const mysql = require('mysql2')
    let connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_RECTIFYD
    });
    connection.connect(function(err) {
        if (err) throw err;
    });
    return connection
}