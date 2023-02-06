const express = require("express");
const app = express();
const db = require('../models');
const bcrypt = require("bcryptjs");
const Router = express.Router();
const mysql = require("mysql2");
const db = require("../config/db");
const { BasicAuth } = require('../utils/auth');
const saltRounds = 10;

//create main model
const Product = db.products;
const User = db.users;

//Health check
Router.get("/healthz", (req, res) => {
    res.status(200).send();
});

// Create a new user - POST unauthenticated
Router.post("/v1/user", async (req, res) => {
    try{
        const {first_name, last_name, username, password} = req.body;
        if(!first_name || !last_name || !username || !password){
            return res.status(400).send({
                error: 'Bad Request: Missing required fields'
            });
        }
        const hash = await bcrypt.hash(password, saltRounds);
        const user = await User.create({
            first_name: first_name,
            last_name: last_name,
            username: username,
            password: hash,
            account_created: new Date(),
            account_updated: new Date()
        });
        res.status(201).send(user);
    } catch (err) {
        return res.status(400).send({
            error: 'Bad Request: Invalid field in request body'
        });
    }
});

// Get a user - GET Authenticated
Router.get("/v1/user/:userId", async (req, res) => {
    try{
        // Check for Authorization header
        const {username, password} = basicAuth(req.headers.authorization);
        // Select the user from the database with the given username
        const user = await User.findOne({where: {username: username}});
        // If the user is not found, return a 401 Unauthorized response
        if (!user) return res.status(401).send({ error: 'Not authenticated 2' });
        // If the user is found, compare the password in the request with the password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        // If the password does not match, return a 401 Unauthorized response
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated 1' });
        
        if (user.id !== parseInt(req.params.userId)) {//check if user id matches
            return res.status(403).send({//if not, return 403 forbidden
                error: 'Forbidden'
            });
        }
        res.status(200).send(user);//if user id matches, return user
    } catch (err) {
        return res.status(401).send({ error: 'Not authenticated catch' });
    }
});

// Update a user - PUT Authenticated

Router.put("/v1/user/:userId", async (req, res) => {
    try{
        // Check for Authorization header
        const {username, password} = basicAuth(req.headers.authorization);
        // Select the user from the database with the given username
        const user = await User.findOne({where: {username: username}});
        // If the user is not found, return a 401 Unauthorized response
        if (!user) return res.status(401).send({ error: 'Not authenticated 2' });
        // If the user is found, compare the password in the request with the password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        // If the password does not match, return a 401 Unauthorized response
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated 1' });
        
        if (user.id !== parseInt(req.params.userId)) {//check if user id matches
            return res.status(403).send({//if not, return 403 forbidden
                error: 'Forbidden'
            });
        }
        //check if all fields are present and there are no extra fields
        if(Object.keys(req.body).length !== 3 || !req.body.first_name || !req.body.last_name || !req.body.password){
            return res.status(400).send({
                error: 'Bad Request: Missing required fields'
            });
        }

        const {first_name, last_name, password} = req.body;
        if(!first_name || !last_name || !username || !password){
            return res.status(400).send({
                error: 'Bad Request: Missing required fields'
            });
        }
        const hash = await bcrypt.hash(password, saltRounds);
        const user = await User.update({
            first_name: first_name,
            last_name: last_name,
            username: username,
            password: hash,
            account_updated: new Date()
        });
        res.status(200).send(user);
    }
    catch (err) {
        return res.status(400).send({
            error: 'Bad Request: Invalid field in request body'
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
            if (key !== 'first_name' && key !== 'last_name' && key !== 'password' ) {
                return res.status(400).send({
                    error: 'Bad Request: Invalid field in request body'
                });
            }
        }
        // Hash the password from the request body
        const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
        // Validate required parameters
        if (!req.body.first_name || !req.body.last_name || !req.body.password) {
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