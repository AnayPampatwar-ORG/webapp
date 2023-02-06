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

        //check if sku already exists
        const skuexisting = Product.findOne({where: {sku: req.body.sku}});
        if (skuexisting) {
            return res.status(400).send({
                error: 'Bad Request: SKU already exists'
            });
        }

        //check if quantity is valid
        if (req.body.quantity < 0 || req.body.quantity > 100) {
            return res.status(400).send({
                error: 'Bad Request: Quantity must be between 0 and 100'
            });
        }

        //if product does not exist, create product
        const {name, description, sku, manufacturer, quantity} = req.body;
        const product = await Product.create({
            name: name,
            description: description,
            sku: sku,
            manufacturer: manufacturer,
            quantity: quantity
        });
        res.status(201).send(product);
    } catch (err) {
        return res.status(401).send({ error: 'Not authenticated' });

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

        //check if sku already exists
        const skuexisting = Product.findOne({where: {sku: req.body.sku}});
        if (skuexisting) {
            return res.status(400).send({
                error: 'Bad Request: SKU already exists'
            });
        }

        //check if quantity is valid
        if (req.body.quantity < 0 || req.body.quantity > 100) {
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
        res.status(201).send(product);
    } catch (err) {
        return res.status(401).send({ error: 'Not authenticated' });

    }
});

//delete a product - DELETE Authenticated
router.delete('/v1/product/:productId', async (req, res) => {
    try{
        const {username, password} = BasicAuth(req.headers.authorization);
        const user = await User.findOne({where: {username: username}});
        if (!user) return res.status(401).send({ error: 'Not authenticated' });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated' });
        const product = await Product.destroy({where: {id: req.params.productId}});
        res.status(201).send(product);

    } catch (err) {
        return res.status(401).send({ error: 'Not authenticated' });

    
    }
});



module.exports = router;