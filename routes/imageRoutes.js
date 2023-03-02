const db = require('../models');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Crypto=require('crypto');
const saltRounds = 10;
const { BasicAuth } = require('../utils/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = require('../uploadValidate');
const Product = db.products;
const User = db.users;
const Image = db.images;


const randomName =(filename)=>{
    const randomName = Crypto.randomBytes(16).toString('hex');
    const extension = filename.split('.').pop();
    return `${randomName}.${extension}`;

} 
const {S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const auth = require('basic-auth');

const s3 = new S3Client({
    region: process.env.S3_REGION,
    // credentials: {
    // accessKeyId: process.env.AWS_ACCESS_KEY,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    // }
});




router.post("/v1/product/:productId/image",
 upload.single('img_name'), 
    async (req, res) => {
        try {
            const {username, password} = BasicAuth(req.headers.authorization);
        const user = await User.findOne({where: {username: username}});
        if (!user) return res.status(401).send({ error: 'Not authenticated1' });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).send({ error: 'Not authenticated2' });
        
            const product = await Product.findOne({
                where: {
                    id: req.params.productId
                }
            });
            if (!product) {
                return res.status(404).send({
                    error: 'Product not found'
                });
            }
            


            const params={
                Bucket: process.env.S3_BUCKET,
                Key: randomName(req.file.originalname),
                Body: req.file.buffer,
                ContentType: req.file.mimetype
                
            }

            await s3.send(new PutObjectCommand(params));    
            const image = await Image.create({
                product_id: req.params.productId,
                file_name: req.file.originalname,
                s3_bucket_path: "s3://"+process.env.S3_BUCKET + '/' + params.Key    
            });
            console.log(image.dataValues.s3_bucket_path.split("/").pop())
            res.status(201).send(image);


        } catch(error) {
            console.log(error);
            res.status(500).send({
                error: 'Internal Server Error'
            });


        }

    });


router.get("/v1/product/:productId/image", async (req, res) => {
    try {
        const {username, password} = BasicAuth(req.headers.authorization);
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        if (user) {
            const validPassword = await bcrypt.compare(password, user.password);
            if (validPassword) {
                const image = await Image.findAll({
                    where: {
                        product_id: req.params.productId
                    }
                });
                res.status(200).send(image);
            }
            
            else{
                res.status(401).send({
                    error: 'Invalid username or password'
                });
            }
            
        } else {
            res.status(401).send({
                error: 'Invalid username or password'
            });
        }

        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Internal Server Error'
        });
    }

});

router.get("/v1/product/:productId/image/:imageId", async (req, res) => {

    try {
        const {username, password} = BasicAuth(req.headers.authorization);
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        if (!user) {
            res.status(401).send({
                error: 'Invalid username or password'
            });
        } else {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                res.status(401).send({
                    error: 'Invalid username or password'
                });
            }
        }
        const image = await Image.findOne({
            where: {
                product_id: req.params.productId,
                image_id: req.params.imageId
            }
        });
        res.status(200).send(image);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Internal Server Error'
        });
    }

});

router.delete("/v1/product/:productId/image/:imageId", async (req, res) => {
    try {
        const image = await Image.findOne({
            where: {
                product_id: req.params.productId,
                image_id: req.params.imageId
            }
        });
        if (image) {

            const params={
                Bucket: process.env.S3_BUCKET,
                Key: image.dataValues.s3_bucket_path.split("/").pop()
            }
            console.log(image.dataValues.s3_bucket_path.split("/").pop())

            try{

                await s3.send(new DeleteObjectCommand(params));
            }
            catch(error){
                console.log(error);
                res.status(500).send({
                    error: 'Internal Server Error 88' 
                });
            }

            
            await image.destroy();
            res.status(200).send({
                message: "Image deleted successfully"
            });
        } else {
            res.status(404).send({
                error: "Image not found"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Internal Server Error'
        });
    }

});



    module.exports = router;