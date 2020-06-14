'use strict'

const User = require('../models/user');
const HttpStatus = require('http-status-codes');
const UserService = require('../services/user');

async function signUp(req, res) {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      if (user.emailVerified) {
        return res.status(HttpStatus.BAD_REQUEST).send({ message: 'El email ingresado ya se encuentra asociado a otra cuenta.' })
      } else {
        await UserService.sendVerificationEmail(user, req.headers.host);
      }
    } else {
      user = await UserService.create(req.body, req.headers.host)
    }

    res.status(HttpStatus.OK).send({
      user: user,
      message: `Un email de verificación ha sido enviado a la dirección de correo electrónico ${user.email}`
    });
  }
  catch (err) {
    console.log("singup => error:", err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: `Error al crear el usuario: ${err.message}` });
  }
}

async function signIn(req, res) {
  try {
    if (!req.body.email) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errors: { email: 'No puede estar vacío' } })
    }

    if (!req.body.password) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errors: { password: 'No puede estar vacía' } })
    }

    let user = await UserService.authenticate(req.body);

    if (user) {
      if (user.emailVerified) {
        return res.status(HttpStatus.OK).send({ user: user });
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).send({ message: 'Tu email no ha sido verificado.' });
      }
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Nombre de usuario o contraseña incorrectas' });
    }
  } catch (err) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: `Error al querer iniciar sesión: ${err.message}` });
  }
}

async function signInWithoutPass(req, res) {
  try {
    if (!req.body.email) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errors: { email: 'No puede estar vacío' } })
    }

    let user = await UserService.authenticateWithoutPass(req.body.email);

    if (user) {
      return res.status(HttpStatus.OK).send({ user: user });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Nombre de usuario o contraseña incorrectas' });
    }
  } catch (err) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: `Error al querer iniciar sesión: ${err.message}` });
  }
}

async function getUser(req, res, next) {
  try {
    if (!req.params.userId) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errors: { userId: 'No puede estar vacío' } })
    }
    let user = await UserService.findByIdAndRetrieveToken(req.params.userId);

    if (user) {
      return res.status(HttpStatus.OK).send({ user: user });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Usuario Incorrecto' });
    }
  }
  catch{

  }
}

function getUserByEmail(req, res, next) {
  try {
    User.find({ email: req.params.email }, async (err, user) => {
      if (user.length > 0) {
        let userAuth = await UserService.authenticateWithoutPass(user[0].email)
        if (userAuth) {
          return res.status(HttpStatus.OK).send({ user: userAuth });
        } else {
          return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Nombre de usuario o contraseña incorrectas' });
        }
      }
      else {
        return res.status(HttpStatus.OK).send({ user: null });
      }
    });
  } catch (err) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: `Error al querer iniciar sesión: ${err.message}` });
  }
}

function updateUser(req, res) {
  let userId = req.body._id
  let bodyUpdate = req.body

  User.findByIdAndUpdate(userId, bodyUpdate, (err, userUpdated) => {
    if (err) return res.status(500).send({ message: `Error al querer actualizar los datos del usuario: ${err}` })

    res.status(200).send({ user: userUpdated })
  })

}

async function verificationToken(req, res) {
  try {
    const token = req.params.token;
    const message = UserService.accountVerification(token);
    res.status(HttpStatus.OK).send({ message: message });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: `Error durante la verificación del email: ${err.message}` });
  }
}

module.exports = {
  signUp,
  signIn,
  getUser,
  updateUser,
  getUserByEmail,
  signInWithoutPass,
  verificationToken
}