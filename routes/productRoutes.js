const db = require('../models');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const {
    BasicAuth
} = require('../utils/auth');
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.S3_REGION,
    // credentials: {
    // accessKeyId: process.env.AWS_ACCESS_KEY,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    // }
});

//statsd imports
const logger = require('../config/logger');
const StatsD = require('node-statsd');
const statsd = new StatsD({
    host: "localhost",
    port: 8125
});
var start = new Date();


//create main model
const Product = db.products;
const User = db.users;
const Image = db.images;

//main work

//create a new product - POST Authenticated
router.post('/v5/product', async (req, res) => {
    try {
        statsd.increment('endpoint.product.post');
        const {
            username,
            password
        } = BasicAuth(req.headers.authorization);
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        if (!user) return res.status(401).send({
            error: 'Not authenticated1'
        });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({
            error: 'Not authenticated2'
        });
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
        const skuexisting = await Product.findOne({
            where: {
                sku: req.body.sku
            }
        });
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
        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
        } = req.body;
        const product = await Product.create({
            name: name,
            description: description,
            sku: sku,
            manufacturer: manufacturer,
            quantity: quantity,
            owner_user_id: user.id

        });
        logger.info("product - POST - Product created");
        
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
        console.log(err);
        logger.error(err);
        return res.status(400).send("Bad Request");

    }
});

//get all products - GET Unauthenticated
router.get('/v2/product/:productId', async (req, res) => {
    try {
        statsd.increment('endpoint.product.get');
        const productId = req.params.productId;
        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).send({
            error: 'Product not found'
        });
        logger.info("product - GET - Product found");
        
        return res.send(product);
    } catch (error) {
        console.log(error);
        logger.error(error);
        return res.status(400).send("Bad Request");
    }
});

//Put a product - PUT Authenticated
router.put('/v2/product/:productId', async (req, res) => {
    try {
        statsd.increment('endpoint.product.put');
        const {
            username,
            password
        } = BasicAuth(req.headers.authorization);
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        if (!user) return res.status(401).send({
            error: 'Not authenticated'
        });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({
            error: 'Not authenticated'
        });
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
            return res.status(403).send({
                error: 'Forbidden: Only the user who added the product can update the product'
            });
        }

        //check if sku already exists
        const skuexisting = await Product.findOne({
            where: {
                sku: req.body.sku
            }
        });

        if (skuexisting && skuexisting.id != req.params.productId) {
            console.log(skuexisting.id);
            console.log(req.params.productId);
            return res.status(400).send({
                error: 'Bad Request: SKU already exists'
            });
        }

        //check if quantity is valid and not a string type
        if (req.body.quantity < 0 || req.body.quantity > 100 || typeof req.body.quantity !== 'number') {
            return res.status(400).send({
                error: 'Bad Request: Quantity must be between 0 and 100'
            });
        }


        //if product does not exist, create product
        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
        } = req.body;
        const product = await Product.update({
            name: name,
            description: description,
            sku: sku,
            manufacturer: manufacturer,
            quantity: quantity,
            date_updated: new Date()
        }, {
            where: {
                id: req.params.productId
            }
        });
        logger.info("product - PUT - Product updated");
       
        res.status(204).send({
            "message": "Product updated successfully"
        });
    } catch (err) {
        console.log(err);
        logger.error(err);
        return res.status(400).send("Bad Request");

    }
});

//patch a product - PATCH Authenticated
router.patch('/v2/product/:productId', async (req, res) => {
    try {
        statsd.increment('endpoint.product.patch');
        const {
            username,
            password
        } = BasicAuth(req.headers.authorization);
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        if (!user) return res.status(401).send({
            error: 'Not authenticated1'
        });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({
            error: 'Not authenticated2'
        });
        
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
            return res.status(403).send({
                error: 'Forbidden: Only the user who added the product can update the product'
            });
        }
       
        //check if request body contains any other fields than the editable fields
        const fields = req.body;
        for (const key in fields) {
            if (key !== 'name' && key !== 'description' && key !== 'sku' && key !== 'manufacturer' && key !== 'quantity') {
                return res.status(400).send({
                    error: 'Bad Request: Invalid field in request body'
                });
            }
        }
        
        //check if req body contains at least one editable field
        if (!req.body.name && !req.body.description && !req.body.sku && !req.body.manufacturer && !req.body.quantity) {
            return res.status(400).send({
                error: 'Bad Request: At least one field must be present in request body'
            });
        }
        

        //check if request body contains sku
        if (req.body.sku) {
            //check if sku already exists
            const skuexisting = await Product.findOne({
                where: {
                    sku: req.body.sku
                }
            });
            if (skuexisting && skuexisting.id != req.params.productId) {
                return res.status(400).send({
                    error: 'Bad Request: SKU already exists'
                });
            }
        }
        

        //check if request body contains quantity
        if (req.body.quantity) {
            //check if quantity is valid and not a string type
            if (req.body.quantity < 0 || req.body.quantity > 100 || typeof req.body.quantity !== 'number') {
                return res.status(400).send({
                    error: 'Bad Request: Quantity must be between 0 and 100 and must be a number'
                });
            }
        }

        //if product does not exist, create product with only the fields that are present in the request body
        
        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
        } = req.body;
        const product = await Product.update({
            name: name || product1.name, //if name is not present in the request body, use the existing name
            description: description || product1.description,
            sku: sku || product1.sku,
            manufacturer: manufacturer || product1.manufacturer,
            quantity: quantity || product1.quantity,
            date_updated: new Date()
        }, {
            where: {
                id: req.params.productId
            }
        });
        logger.info("product - PATCH - Product updated");
        
        res.status(204).send({
            "message": "Product updated successfully"
        });
    } catch (err) {
        console.log(err);
        logger.error(err);
        return res.status(400).send("Bad Request");

    }
});



//delete a product - DELETE Authenticated
router.delete('/v2/product/:productId', async (req, res) => {
    try {
        statsd.increment('endpoint.product.delete');
        const {
            username,
            password
        } = BasicAuth(req.headers.authorization);
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        if (!user) return res.status(401).send({
            error: 'Not authenticated 1'
        });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({
            error: 'Not authenticated 2'
        });
        //check if product exists
        const product1 = await Product.findByPk(req.params.productId);
        if (!product1) {
            return res.status(404).send({
                error: 'Not Found: Product does not exist'
            });

        }
        //Only the user who added the product can delete the product
        const product2 = await Product.findByPk(req.params.productId);
        if (product2.owner_user_id !== user.id) {
            return res.status(403).send({
                error: 'Forbidden: Only the user who added the product can delete the product'
            });
        }

        //delete product

        const images = await Image.findAll({
            where: {
                product_id: req.params.productId
            }
        });
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const params = {
                    Bucket: process.env.S3_BUCKET,
                    Key: images[i].dataValues.s3_bucket_path.split("/").pop()
                };
                await s3.send(new DeleteObjectCommand(params));
            }
            await Image.destroy({
                where: {
                    product_id: req.params.productId
                }
            });
        }


        const product = await Product.destroy({
            where: {
                id: req.params.productId
            }
        });
        logger.info("product - DELETE - Product deleted");
        
        return res.status(204).send();

    } catch (err) {
        console.log(err)
        logger.error(err);
        return res.status(400).send("Bad Request");
    }
});

module.exports = router;