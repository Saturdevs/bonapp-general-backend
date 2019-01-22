'use strict'

const jwt = require('express-jwt')
const config = require('../config')

function getTokenFromHeader(req){
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

var auth = {
  required: jwt({
    secret: config.SECRET_TOKEN,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: config.SECRET_TOKEN,
    userProperty: 'payload',
    credentialsRequiread: false,
    getToken: getTokenFromHeader
  })
}

module.exports = auth