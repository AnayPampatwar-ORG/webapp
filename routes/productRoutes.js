const db = require('../models');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const { BasicAuth } = require('../utils/auth');



//create main model
const Product = db.products;
const User = db.users;

//main work

//create a new product - POST Authenticated
router.post('/v1/product', async (req, res) => {
    try{
        const {username, password} = BasicAuth(req.headers.authorization);
        const user = await User.findOne({where: {username: username}});
        if (!user) return res.status(401).send({ error: 'Not authenticated1' });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated2' });
        //check if request body contains all required fields and no other fields
        if (!req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer || !req.body.quantity) {
            return res.status(400).send({
                error: 'Bad Request: Missing required fields'
            });
        }
        if (Object.keys(req.body).length !== 5) {
            return res.status(400).send({
                error: 'Bad Request: Too many fields'
            });
        }



        //check if sku already exists
        const skuexisting = await Product.findOne({where: {sku: req.body.sku}});
        console.log(skuexisting);
        console.log("skuexisting")
        if (skuexisting) {
            return res.status(400).send({
                error: 'Bad Request: SKU already exists4'
            });
        }

        //check if quantity is between 0 and 100 and not a string type 
        if (req.body.quantity < 0 || req.body.quantity > 100 || typeof req.body.quantity !== 'number') {
            return res.status(400).send({
                error: 'Bad Request: Quantity must be between 0 and 100'
            });
        }
        

        //if product does not exist, create product
        const {name, description, sku, manufacturer, quantity} = req.body;
        console.log("Here1")
        const product = await Product.create({
            name: name,
            description: description,
            sku: sku,
            manufacturer: manufacturer,
            quantity: quantity,
            owner_user_id: user.id

        });
        //return product id and sku
        return res.status(201).send({
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            manufacturer: product.manufacturer,
            quantity: product.quantity,
            owner_user_id: product.owner_user_id,
            date_created: product.date_created,
            date_updated: product.date_updated

        });
    } catch (err) {
        return res.status(401).send({ error: 'Not authenticated5' });

    }
});

//get all products - GET Unauthenticated
router.get('/v1/product/:productId', async (req, res) => {
    try {
      const productId = req.params.productId;
      const product = await Product.findByPk(productId);
      if (!product) return res.status(404).send({ error: 'Product not found' });
      return res.send(product);
    } catch (error) {
      return res.status(500).send({ error: 'Internal server error' });
    }
  });

//Put a product - PUT Authenticated
router.put('/v1/product/:productId', async (req, res) => {
    try{
        const {username, password} = BasicAuth(req.headers.authorization);
        const user = await User.findOne({where: {username: username}});
        if (!user) return res.status(401).send({ error: 'Not authenticated' });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated' });
        //check if request body contains any other fields than the editable fields
        const fields = req.body;
        for (const key in fields) {
            if (key !== 'name' && key !== 'description' && key !== 'sku' && key !== 'manufacturer' && key !== 'quantity') {
                return res.status(400).send({
                    error: 'Bad Request: Invalid field in request body'
                });
            }
        }
        //check if req body contains all required fields
        if (!req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer || !req.body.quantity) {
            return res.status(400).send({
                error: 'Bad Request: Missing required fields'
            });
        }
        //check if product exists
        const product1 = await Product.findByPk(req.params.productId);
        if (!product1) {
            return res.status(404).send({
                error: 'Not Found: Product does not exist'
            });
        }

        //Only the user who added the product can update the product
        const product2 = await Product.findByPk(req.params.productId);
        if (product2.owner_user_id !== user.id) {
            return res.status(401).send({
                error: 'Not authorized'
            });
        }

        //check if sku already exists
        const skuexisting = await Product.findOne({where: {sku: req.body.sku}});
    
        if (skuexisting && skuexisting.id != req.params.productId) {
            console.log(skuexisting.id);
            console.log(req.params.productId);
            return res.status(400).send({
                error: 'Bad Request: SKU already extghbthbists'
            });
        }

        //check if quantity is valid and not a string type
        if (req.body.quantity < 0 || req.body.quantity > 100 || typeof req.body.quantity !== 'number') {
            return res.status(400).send({
                error: 'Bad Request: Quantity must be between 0 and 100'
            });
        }


        //if product does not exist, create product
        const {name, description, sku, manufacturer, quantity} = req.body;
        const product = await Product.update({
            name: name,
            description: description,
            sku: sku,
            manufacturer: manufacturer,
            quantity: quantity
        }, {where: {id: req.params.productId}});
        res.status(204).send({"message": "Product updated successfully"});
    } catch (err) {
        return res.status(401).send({ error: 'Not authenticated' });

    }
});

//patch a product - PATCH Authenticated


//delete a product - DELETE Authenticated
router.delete('/v1/product/:productId', async (req, res) => {
    try{
        const {username, password} = BasicAuth(req.headers.authorization);
        const user = await User.findOne({where: {username: username}});
        if (!user) return res.status(401).send({ error: 'Not authenticated 1' });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated 2' });
        const product = await Product.destroy({where: {id: req.params.productId}});
        return res.status(204).send();

    } catch (err) {
        return res.status(401).send({ error: 'Not authenticated 3' });
    }
});

module.exports = router;