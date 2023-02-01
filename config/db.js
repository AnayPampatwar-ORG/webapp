require("dotenv").config();

const mysql = require("mysql2");

// Create connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,

    // Your port; if not 3306
    port: process.env.DB_PORT,

    // Your username
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});

//Connect
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("MySQL Connected...");
});


module.exports = db.promise();// Export connection
