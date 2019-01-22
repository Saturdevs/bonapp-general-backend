'use strict'

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = require('../models/user')

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, (email, password, done) => {
  User.findOne({email: email}, (err, user) => {
    if(!user) {
      return done(null, false, {errors: {'email': 'incorrecto'}})
    }

    if(!user.validPassword(password)){
      return done(null, false, {errors: {'contraseña': 'incorrecta'}})
    }

    return done(null, user)
  }).catch(done)
}))