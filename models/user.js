'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const config = require('../config')

const userSchema = Schema({
  username: { type: String, lowercase: true, required: [true, "can't be blank"], unique: true, index: true },
  email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true, unique: true},
  phone: { type: String },  
  password: { type: String, required: true },
  salt: { type: String }
}, {timestamps: true});

userSchema.pre('save', function (next) {
  let user = this
  if (!user.isModified('password')) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if(err) return next(err)

    user.salt = salt

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err)

      user.password = hash
      next()
    })
  })
})

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

userSchema.methods.generateJWT = function() {

  let user = this

  const payload = {
    id: user._id,
    username: user.username,
    iat: moment().unix(),
    exp: moment().add(60, 'days').unix(),
  }

  return jwt.sign(payload, config.SECRET_TOKEN)
};

userSchema.methods.toAuthJSON = function(){
  
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

module.exports = mongoose.model('User', userSchema);