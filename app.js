'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const restaurantRouter = require('./routes/restaurantRoutes')
const userRouter = require('./routes/userRoutes')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(function (req, res, next) {
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
res.header('access-Control-Allow-Origin', '*');
next();
});

app.use('/api/restaurant', restaurantRouter)
app.use('/api/user', userRouter)

//Middleware to handle error
app.use(function errorHandler(err, req, res, next) {
  if(err.name === 'ValidationError'){
    return res.status(422).send({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    })
  }

  return next(err);
})

module.exports = app