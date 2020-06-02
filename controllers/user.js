'use strict'

const User = require('../models/user');
const HttpStatus = require('http-status-codes');
const UserService = require('../services/user');

async function signUp (req, res) {
  try {
    const user = new User({
      name: req.body.name,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      roleId: req.body.roleId
    })
  
    let userSaved = await UserService.create(user);

    res.status(HttpStatus.OK).send({ message: 'El usuario ha sido creado correctamente!' });
  }
  catch (err) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: `Error al crear el usuario: ${err.message}`});
  }
}

async function signIn (req, res) {
  try {
    if(!req.body.email){
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errors: {email: 'No puede estar vacío'} })
    }
  
    if(!req.body.password){
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errors: {password: 'No puede estar vacía'} })
    }    

    let user = await UserService.authenticate(req.body);

    if (user) {
      return res.status(HttpStatus.OK).send({ user: user });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Nombre de usuario o contraseña incorrectas'});
    }    
  } catch (err) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: `Error al querer iniciar sesión: ${err.message}`});
  }
}

function getUser(req, res, next){
  User.findById(req.payload.id, (err, user) => {
    if(!user) {
      return res.status(401)
    }

    return res.status(200).send( {user: user.toAuthJSON() })
  }).catch(next)
}

function getUserByEmail(req, res, next){
  User.find({email: req.email}, (err, user) => {
    if(!user) {
      return res.status(200).send( {user: null })
    }
    return res.status(200).send( {user: user.toAuthJSON() })
  }).catch(next)
}

function updateUser(req, res){
  let userId = req.payload.id
  let bodyUpdate = req.body

  User.findByIdAndUpdate(userId, bodyUpdate, (err, userUpdated) => {
    if (err) return res.status(500).send({ message: `Error al querer actualizar los datos del usuario: ${err}`})

    res.status(200).send({ user: userUpdated.toAuthJSON() })
  })

}

module.exports = {
  signUp,
  signIn,
  getUser,
  updateUser,
  getUserByEmail
}