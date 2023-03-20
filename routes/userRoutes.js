const express = require("express");
const app = express();
const db = require('../models');
const bcrypt = require("bcryptjs");
const Router = express.Router();

const { BasicAuth } = require('../utils/auth');
const saltRounds = 10;

//create main model
const Product = db.products;
const User = db.users;

//statsd imports
const logger = require('../config/logger');
const StatsD = require('node-statsd');
const statsd = new StatsD({ host: "localhost", port: 8125 });
var start = new Date();

//Health check
Router.get("/healthz", (req, res) => {
    res.status(200).send();
});

// Create a new user - POST unauthenticated
Router.post("/v1/user", async (req, res) => {
    try{
        statsd.increment('endpoint.user.post');
        const {first_name, last_name, username, password} = req.body;
        
        //check if request body contains any other fields than the editable fields
        const fields = req.body;
        for (const key in fields) {
            if (key !== 'first_name' && key !== 'last_name' && key !== 'username' && key !== 'password') {
                logger.error("Bad Request - user - POST: Invalid field in request body other than 4");
                return res.status(400).send({
                    error: 'Bad Request: Invalid field in request body other than 4'
                });
            }
        }
        //check if any required fields are missing
        if(!first_name || !last_name || !username || !password){
            logger.error("Bad Request user - POST : Missing required fields");
            return res.status(400).send({
                error: 'Bad Request: Missing required fields'
            });
        }
        //check if username already exists
        const userexisting = await User.findOne({where: {username: username}});
        if (userexisting) {
            logger.error("Bad Request user - POST: Username already exists");
            return res.status(400).send({
                error: 'Bad Request: Username already exists 1'
            });
        }

        
        //regex for email
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(username)) {
            return res.status(400).send({
                error: 'Bad Request: Invalid email address'
            });
        }
        //password length
        if (password.length < 8) {
            return res.status(400).send({
                error: 'Bad Request: Password must be at least 8 characters'
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
        
        //in response send user object without password field and return 201 Created response code
        logger.info("Request Success user - POST: User created");
        

        res.status(201).send({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            account_created: user.account_created,
            account_updated: user.account_updated
        });
    } catch (err) {
        console.log(err);
        logger.error("Bad Request user - POST: " + err);
        return res.status(400).send("Bad Request");
    }
});

// Get a user - GET Authenticated
Router.get("/v1/user/:userId", async (req, res) => {
    try{
        statsd.increment('endpoint.user.get');
        //check if headers are present
        if (!req.headers.authorization) return res.status(401).send({ error: 'Headers not present' });
        // Check for Authorization header
        const {username, password} = BasicAuth(req.headers.authorization);
        // Select the user from the database with the given username
        const user = await User.findOne({where: {username: username}});
        // If the user is not found, return a 401 Unauthorized response
        if (!user) return res.status(401).send({ error: 'Not authenticated' });
        // If the user is found, compare the password in the request with the password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        // If the password does not match, return a 401 Unauthorized response
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated 1' });
        
        if (user.id !== parseInt(req.params.userId)) {//check if user id matches
            return res.status(403).send({//if not, return 403 forbidden
                error: 'Forbidden'
            });
        }
        //in response send user object without password field and return 200 OK response code 
        logger.info("Request Success user - GET: User found");
        
        res.status(200).send({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            account_created: user.account_created,
            account_updated: user.account_updated
        });


    } catch (err) {
        console.log(err);
        logger.error("Bad Request user - GET: " + err);
        return res.status(400).send({ error: 'Bad Request' });
    }
});

// Update a user - PUT Authenticated

Router.put("/v1/user/:userId", async (req, res) => {
    try{
        statsd.increment('endpoint.user.put');
        // Check for Authorization header
        const {username, password} = BasicAuth(req.headers.authorization);
        
        // Select the user from the database with the given username
        
        const user = await User.findOne({where: {username: username}});
        
        // If the user is not found, return a 401 Unauthorized response
        if (!user) return res.status(401).send({ error: 'Not authenticated' });
        
        // If the user is found, compare the password in the request with the password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        // If the password does not match, return a 401 Unauthorized response
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated' });
        
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

        const {first_name, last_name} = req.body;
        const password1 = req.body.password;
        
        const hash = await bcrypt.hash(password1, saltRounds);
        const user1 = await User.update({
            first_name: first_name,
            last_name: last_name,
            username: username,
            password: hash,
            account_updated: new Date() 
        },{where: {username: username}});
        logger.info("Request Success user - PUT: User updated");
        
        res.status(204).send(user1);
    }
    catch (err) {
        console.log(err)
        logger.error("Bad Request user - PUT: " + err);
        return res.status(400).send("Bad Request");
    }
});


  
module.exports = Router;