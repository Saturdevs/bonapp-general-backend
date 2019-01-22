'use strict'

const User = require('../models/user')
const passport = require('passport')

function signUp (req, res, next) {
  const user = new User({
    username: req.body.user.username,
    email: req.body.user.email,
    phone: req.body.user.phone,
    password: req.body.user.password
  })

  user.save((err) => {
    if (err) res.status(500).send({ message: `Error al crear el usuario: ${err}` })

    return res.status(200).send({ user: user.toAuthJSON() })
  })
}

function signIn (req, res, next) {
  if(!req.body.user.email){
    return res.status(422).send({ errors: {email: 'No puede estar vacío'} })
  }

  if(!req.body.user.password){
    return res.status(422).send({ errors: {password: 'No puede estar vacía'} })
  }

  passport.authenticate('local', {session: false}, (err, user, info) => {
    if(err){ return next(err) }

    if(user){
      user.token = user.generateJWT()
      return res.status(200).send({
        message: 'Logueado correctamente',
        user: user.toAuthJSON()
      })
    } else {
      return res.status(422).send(info)
    }
  })(req, res, next)
}

function getUser(req, res, next){
  User.findById(req.payload.id, (err, user) => {
    if(!user) {
      return res.status(401)
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
  updateUser
}