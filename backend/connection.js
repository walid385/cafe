const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
    });

connection.connect((err) => {
    if (!err){
        console.log('Connected to the MySQL server.');
    }
    else{
        console.log(`Failed to connect to the MySQL server ${err}`);
    }
}
);



module.exports = connection;