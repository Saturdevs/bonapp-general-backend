'use strict'

const express = require('express')
const userCtrl = require('../controllers/user')
const userRouter = express.Router()
const auth = require('../middlewares/auth')
const passport = require('passport')

userRouter.post('/signup', userCtrl.signUp)
userRouter.post('/signin', userCtrl.signIn)
userRouter.get('/', auth.required, userCtrl.getUser)
userRouter.put('/', auth.required, userCtrl.updateUser)

module.exports = userRouter