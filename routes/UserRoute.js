const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const uploadImage = require('../helpers/uploadImage.js');
const User = require('../models/User.js');
const config = require('../config');

const userRouter = express.Router();

userRouter.post('/sign-up', uploadImage.single('profilePic'), [
    check('username', 'username is required').not().isEmpty(),
    check('email', 'email is required and should be valid').isEmail(),
    check('password', 'password is minimum of 6 characters').isLength({ min: 6 })
], async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body;
    const imageData = req.file ? fs.readFileSync(req.file.path, 'base64') : null;

    try{
        const user = await User.findOne({
            email: email
        });

        if(user){
            return res.status(400).json({
                errors: [
                    { msg: 'User already exists' }
                ]
            });
        }

        const newUser = new User({
            username: username,
            email: email,
            password: password,
            profilePic: imageData
        });

        const salt = await bcrypt.genSalt(10);

        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        const payload = {
            user: {
                email: newUser.email
            }
        }

        jwt.sign(
            payload,
            config.jwtSecret,
            {
                expiresIn: 3600000
            },
            (err,token) => {
                if(err){
                    throw err;
                }

                return res.json({
                    token: token,
                });
            }
        );

    }catch (err){
        console.error(err);
        return res.status(500).send('server error');
    }
});

userRouter.post('/sign-in',[

    check('email', 'email is required and should be valid').isEmail(),
    check('password', 'password is minimum of 6 characters').isLength({ min: 6 })
],
    async (req, res) => {

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;

        try{
            let user = await User.findOne({
                email: email
            });

            if(!user){
                return res.status(400).json({
                    errors: [
                        { msg: 'invalid credentials' }
                    ]
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400).json({
                    errors: [
                        { msg: 'invalid credentials' }
                    ]
                });
            }

            const payload = {
                user: {
                    email: user.email
                }
            }

            jwt.sign(
                payload,
                config.jwtSecret,
                {
                    expiresIn: 3600000
                },
                (err,token) => {
                    if(err){
                        throw err;
                    }

                    return res.json({
                        token: token,

                    });
                }
            );
        }catch (err){
            console.error(err);
            return res.status(500).send('server error');
        }
});

module.exports = userRouter;