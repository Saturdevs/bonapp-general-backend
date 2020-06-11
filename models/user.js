'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const userSchema = Schema({  
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true, unique: true},
  username: { type: String },  
  phone: { type: String },  
  salt: { type: String },
  facebookId: { type: String },
  googleId: { type: String },
  password: { type: String },
  roleId:  { type: String, required: true },
  openOrder: { 
    orderId: { type: String },
    tableNumber: { type: Number },
    created: {type: String },
    restaurantId: {type: String }
  }
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

userSchema.methods.toAuthJSON = function(){
  
  return {
    email: this.email,
    token: this.generateJWT()
  };
};

module.exports = mongoose.model('User', userSchema);