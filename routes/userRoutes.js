'use strict'

const express = require('express');
const userCtrl = require('../controllers/user');
const userRouter = express.Router();
const expressJwt = require('express-jwt');
const { SECRET_TOKEN } = require('../config');

userRouter.post('/signup', userCtrl.signUp);
userRouter.post('/signin', userCtrl.signIn);
userRouter.post('/signinWithoutPass', userCtrl.signInWithoutPass);
userRouter.get('/verification/:token', expressJwt({ secret: SECRET_TOKEN }), userCtrl.verificationToken);
userRouter.get('/', userCtrl.getUser);
userRouter.get('/:userId', userCtrl.getUser);
userRouter.get('/userByEmal/:email', userCtrl.getUserByEmail);
userRouter.put('/', userCtrl.updateUser);

module.exports = userRouter;