const express = require("express");
const app = express();

const bcrypt = require("bcryptjs");
const Router = express.Router();
const mysql = require("mysql2");
const db = require("../config/db");
const basicAuth = require('basic-auth');
const saltRounds = 10;

//basic auth

//Endpoints for health status check
Router.get("/", (req, res) => {
    res.status(200).send();
});

//Health check
Router.get("/healthz", (req, res) => {
    res.status(200).send();
});

// Create a user
Router.post("/v1/user", async (req, res) => {
    const {first_name,last_name,password,username} = req.body;
    // Check if input payload contains any other fields than the editable fields
    const fields = req.body;
    for (const key in fields) {
        if (key !== 'first_name' && key !== 'last_name' && key !== 'password' && key !== 'username') {
            return res.status(400).send({
                error: 'Bad Request: Invalid field in request body'
            });
        }
    }
    //sanitise input
    if (!/^[a-zA-Z]+$/.test(first_name)) {
        console.log("first name should only contain alphabets");
        return res.status(400).json({
            error: "First name should only contain alphabets"
        });
    }


    //check if username already exists
    const sql = `SELECT * FROM users WHERE username = ?`;
    const value = [username];
    const results = await db.query(sql, value);
    if (results[0].length > 0) {
        return res.status(400).send({
            error: 'Bad Request: Username already exists'
        });
    }

    //check if password is valid
    if (password.length < 8) {
        return res.status(400).send({
            error: 'Bad Request: Password must be at least 8 characters'
        });
    }

    

    //if user does not exist, create user
    try {
        let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
        regex.test(req.body.username);
        if (!regex.test(req.body.username)) {
            return res.status(400).send({
                error: 'Bad Request: Email address not valid'
            });
        }

        const hashPassword2 = await bcrypt.hash(password, saltRounds);
        const sql2 = `INSERT INTO users (first_name, last_name, password, username,account_created, account_updated) VALUES (?, ?, ?, ?, now(),now())`;
        const value2 = [first_name, last_name, hashPassword2, username];
        const results2 = await db.query(sql2, value2);
        //retreive user id
        const sql3 = `SELECT id, first_name, last_name,username, account_created, account_updated FROM users WHERE username = ?`;
        const value3 = [username];
        const results3 = await db.query(sql3, value3);
        const user = results3[0];

        return res.status(201).send(user);


    } catch (err) {
        console.log(err.sql);
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
});


Router.get('/v1/user/:userId', async (req, res) => {
    try {

        // Check for Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send({
                error: 'Unauthorized: Missing authorization header'
            });
        }

        // Decode the 'Authorization' header to get the username and password
        const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
            .toString()
            .split(':');

        // Select the user from the database with the given username
        const query = `SELECT * FROM users WHERE username = ?`;
        
        const value = [username];
        const results = await db.query(query, value);
        

        // If the user is not found, return a 401 Unauthorized response
        if (results[0].length === 0) {
            return res.status(401).send({
                error: 'Unauthorized'
            });
        }

        // Get the user from the query result
        const user = results[0][0];

        // Check if the password from the request matches the password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        

        // If the passwords don't match, return a 401 Unauthorized response
        if (!passwordMatch) {
            return res.status(401).send({
                error: 'Unauthorized'
            });
        }

        // If the userId from the URL does not match the userId from the database, return a 403 Forbidden response
        if (user.id !== parseInt(req.params.userId)) {
            return res.status(403).send({
                error: 'Forbidden'
            });
        }

        // Select the user data from the database with the given userId
        const query2 = `SELECT id,first_name,last_name,username,account_created,account_updated FROM users WHERE id = ?`;
        const value2 = [req.params.userId];
        const userData = await db.query(query2, value2);
        

        // If the user data is not found, return a 404 Not Found response
        if (!userData.length) {
            return res.status(404).send({
                error: 'Not found'
            });
        }
        
        // Return the user data to the client
        return res.status(200).send(userData[0]);
    } catch (error) {
        // If there is an error, return a 500 Internal Server Error response
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
});

Router.put('/v1/user/:userId', async (req, res) => {
    try {


        // Check for Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send({
                error: 'Unauthorized: Missing authorization header'
            });
        }

        // Decode the username and password from the Authorization header
        const [username, password3] = Buffer.from(authHeader.split(' ')[1], 'base64')
            .toString()
            .split(':');

        // Check if input payload contains any other fields than the editable fields
        const fields = req.body;
        for (const key in fields) {
            if (key !== 'first_name' && key !== 'last_name' && key !== 'password' && key !== 'username') {
                return res.status(400).send({
                    error: 'Bad Request: Invalid field in request body'
                });
            }
        }
        // Hash the password from the request body
        const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
        // Validate required parameters
        if (!req.body.first_name || !req.body.username || !req.body.password) {
            return res.status(400).json({
                error: 'Bad Request: Missing required parameters'
            });
        }
        // Retrieve the user from the database based on the username
        const query = `SELECT * FROM users WHERE username = '${username}'`;
        const results = await db.query(query);
        if (results[0].length === 0) {
            return res.status(401).send({
                error: 'Unauthorized: Invalid username or password'
            });
        }
        const rows = JSON.parse(JSON.stringify(results[0]));
        const user = rows[0];

        // Compare the password from the request with the password from the database
        const isPasswordMatch = await bcrypt.compare(password3, hashPassword);
        if (!isPasswordMatch) {
            return res.status(401).send({
                error: 'Unauthorized: Invalid username or password'
            });
        }

        // Check if the user from the database matches the user from the URL 
        if (user.id !== parseInt(req.params.userId)) {
            return res.status(403).send({
                error: 'Forbidden: User does not have permission to access this resource'
            });
        }

        // Update the user information
        const {
            first_name,
            last_name
        } = req.body;
        const username2 = req.body.username;
        const updateQuery = `UPDATE users SET first_name = ?, last_name = ?,  password = ?, account_updated = now() WHERE id = ?`;
        const values = [first_name, last_name, hashPassword, req.params.userId];
        await db.query(updateQuery, values);

        
        return res.status(204).send("userResults[0]");
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
});

  
module.exports = Router;