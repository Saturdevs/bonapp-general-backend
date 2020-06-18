'use strict'

const express = require('express');
const userCtrl = require('../controllers/user');
const userRouter = express.Router();

userRouter.post('/signup', userCtrl.signUp);
userRouter.post('/signin', userCtrl.signIn);
userRouter.post('/signinWithoutPass', userCtrl.signInWithoutPass);
userRouter.get('/verification/:token', userCtrl.verificationToken);
userRouter.get('/', userCtrl.getUser);
userRouter.get('/:userId', userCtrl.getUser);
userRouter.get('/userByEmal/:email', userCtrl.getUserByEmail);
userRouter.put('/', userCtrl.updateUser);
userRouter.put('/deleteOpenOrder/:userId', userCtrl.deleteOpenOrder);

module.exports = userRouter;