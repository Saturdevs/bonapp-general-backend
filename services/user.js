'use strice'

const UserDAO = require('../dataAccess/user');
const User = require('../models/user');
const EmailSender = require('../shared/helpers/emailSender');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const config = require('../config');

async function authenticate({ email, password }) {
  let query = { email: email };
  const user = await UserDAO.getUserByQuery(query);
  if (user && bcrypt.compareSync(password, user.password)) {
    const { password, ...userWithoutHash } = user.toObject();
    const token = await generateJWT(user);
    return {
      ...userWithoutHash,
      token
    };
  }
}


async function authenticateWithoutPass(email) {
  let query = { email: email };
  const user = await UserDAO.getUserByQuery(query);
  if (user) {
    const { ...userWithoutHash } = user.toObject();
    const token = await generateJWT(user);
    return {
      ...userWithoutHash,
      token
    };
  }
}
/**
 * @description Genera el token para el usuario dado como parametro.
 * @param {User} user 
 */
async function generateJWT(user) {
  const payload = {
    sub: user._id,
    email: user.email,
    roleId: user.roleId,
    iat: moment().unix(),
    exp: moment().add(60, 'days').unix()
  }

  return jwt.sign(payload, config.SECRET_TOKEN)
}

async function findByIdAndRetrieveToken(userId) {
  const user = await UserDAO.getById(userId);

  if (user) {
    const { ...userWithoutHash } = user.toObject();
    const token = await generateJWT(user);
    return {
      ...userWithoutHash,
      token
    };
  }
}

/**
 * @description Crea un nuevo usuario y lo guarda en la base de datos.
 * @param {JSON} userParam datos con los que se va a crear el nuevo usuario.
 */
async function create(userParam, urlSendEmail = null) {
  try {
    let emailVerified;
    let facebookId = null;
    let googleId = null;    
    if ((userParam.googleId && userParam.googleId !== null && userParam.googleId !== undefined)
      || (userParam.facebookId && userParam.facebookId !== null && userParam.facebookId !== undefined)) {
      emailVerified = true;
      facebookId = userParam.facebookId ? userParam.facebookId : null;
      googleId = userParam.googleId ? userParam.googleId : null;
    } else {
      if (!userParam.password || userParam.password === null && userParam.password === undefined) {
        throw new Error(`Debe ingresar una contraseña.`);
      }
      emailVerified = false;      
    }

    const user = new User({
      name: userParam.name,
      lastname: userParam.lastname,
      email: userParam.email,
      password: userParam.password,
      roleId: userParam.roleId,
      emailVerified: emailVerified,
      facebookId: facebookId,
      googleId: googleId
    });
    const userSaved = await UserDAO.save(user);
    
    if (userSaved.facebookId === null && userSaved.googleId === null && urlSendEmail !== null) {
      await sendVerificationEmail(userSaved, urlSendEmail);
    }

    return userSaved;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function sendVerificationEmail(user, urlSendEmail) {
  const token = await generateJWT(user);
  //TODO: Armar un mail mejor. Ver como añadir imagen de BonApp.      
  await EmailSender.sendEmail({
    from: 'Bonapp <no-reply@bonapp.com>',
    to: user.email,
    subject: 'Verificación de cuenta en BonApp',
    text: 'Hola,\n\n' + 'Gracias por registrarte en BonApp! Por favor, confirmá la dirección de correo electónico ingresada durante el registro haciendo click en el siguiente link: \nhttp:\/\/' + urlSendEmail + '\/api/user/verification\/' + token + '.\n',
    html: 'Hola,\n\n' + 'Gracias por registrarte en BonApp! Por favor, confirmá la dirección de correo electónico ingresada durante el registro haciendo click en el siguiente link: \nhttp:\/\/' + urlSendEmail + '\/api/user/verification\/' + token + '.\n'
  });
}

async function accountVerification(token) {
  try {
    const decodedToken = jwt.verify(token, config.SECRET_TOKEN);    
    let message;
    console.log("ANTES DEL IF PARA CHECKEAR SI EL TOKEN EXPIRO")
    if (moment().unix() < moment(decodedToken.iat).add(12, 'hours').unix()) {
      console.log("ADENTRO DEL IF PARA CHECKEAR SI EL TOKEN EXPIRO")
      const user = await UserDAO.getUserById(decodedToken.sub);
      console.log("USER: " + user)
      if (user) {
        console.log("ENCONTRO USER")
        if (user.emailVerified) {
          console.log("EMAIL YA VERIFICADO")
          message = `Este email ya ha sido verificado.`;
        } else {
          console.log("EMAIL NO VERIFICADO. UPDATE USER")
          await UserDAO.updateUserById(user._id, { emailVerified: true })
          console.log("DESPUES DE UPDETEAR USER")
          message = `La cuenta ha sido verificado, ya puede iniciar sesión.`;
        }
      } else {
        console.log("NO ENCONTRO USER")
        message = `No se ha encontrado ningún usuario para el token.`;
      }
    } else {
      console.log("TOKEN EXPIRO")
      message = `Su token ha expirado. Debe registrarse nuevamente.`;
    }    
    console.log("MESSAGE: " + message)
  } catch (err) {
    throw new Error(err.message);
  }  
}

/**
 * @description Elimina el usuario dado como parámetro de la base de datos.
 * @param {User} user usuario a eliminar de la base de datos.
 */
async function deleteUser(user) {
  try {
    await UserDAO.remove(user);
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  authenticate,
  create,
  deleteUser,
  authenticateWithoutPass,
  findByIdAndRetrieveToken,
  accountVerification,
  sendVerificationEmail
}