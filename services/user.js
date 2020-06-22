'use strice'

const UserDAO = require('../dataAccess/user');
const User = require('../models/user');
const EmailSender = require('../shared/helpers/emailSender');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const config = require('../config');
const HttpStatus = require('http-status-codes');

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
      username: userParam.email,
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
  try {
    const token = await generateJWT(user);
    const url = `https://${urlSendEmail}/api/user/verification/${token}`;        
    await EmailSender.sendEmail({
      from: 'Bonapp <no-reply@bonapp.com>',
      to: user.email,
      subject: 'Verificación de cuenta en BonApp',      
      text: `
      <table
        style="border-spacing:0;border-collapse:collapse;font-family:proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;width:100%!important;height:100%!important;color:#4c4c4c;font-size:15px;line-height:150%;background:#ffffff;margin:0;padding:0;border:0">
        <tbody>
          <tr style="vertical-align:top;padding:0">
            <td align="center" valign="top" style="vertical-align:top;padding:0">
              <table
                style="border-spacing:0;border-collapse:collapse;font-family:proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;width:600px;color:#4c4c4c;font-size:15px;line-height:150%;background:#ffffff;margin:40px 0;padding:0;border:0">
                <tbody>
                  <tr style="vertical-align:top;padding:0">
                    <td align="center" valign="top" style="vertical-align:top;padding:0 40px">
                      <table
                        style="border-spacing:0;border-collapse:collapse;font-family:proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;width:100%;background:#ffffff;margin:0;padding:0;border:0">
                        <tbody>
                          <tr style="vertical-align:top;padding:0">
                            <td style="vertical-align:top;text-align:left;padding:0" align="left" valign="top">
                              <h1
                                style="display:block;font-family:hybrea,proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;font-size:32px;font-weight:200;text-align:left;margin:0 0 40px"
                                align="left"><img
                                  src="data:image/png;base64,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"
                                  alt="bonapp" width="140" height="52" style="outline:none;text-decoration:none;border:0;margin-left: -15px;"
                                  class="CToWUd"></h1>
      
                              <p style="margin:20px 0">
                                Hola,
                                <br>
                                <br>
                                Gracias por registrarte en BonApp!
                                <br>
                                Por favor, confirmá la dirección de correo electónico ingresada durante el registro haciendo
                                click en el siguiente link:
                              </p>
      
                              <p style="margin:20px 0"><a
                                  href=${url}
                                  style="color:#6e5baa" target="_blank">${url}</a>
      
                              </p>
                              <p style="margin:20px 0">
                                Por cualquier consulta puedes contactarnos en:
                                <br>
                                soporte@bonapp.com.ar
                              </p>
      
      
                              <p style="margin:20px 0">
                                El equipo de BonApp<br>
                                <a href="https://bonapp.com.ar" style="color:#6e5baa" target="_blank">https://bonapp.com.ar</a>
                              </p>
                              <p></p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      `,
      html: `
      <table
        style="border-spacing:0;border-collapse:collapse;font-family:proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;width:100%!important;height:100%!important;color:#4c4c4c;font-size:15px;line-height:150%;background:#ffffff;margin:0;padding:0;border:0">
        <tbody>
          <tr style="vertical-align:top;padding:0">
            <td align="center" valign="top" style="vertical-align:top;padding:0">
              <table
                style="border-spacing:0;border-collapse:collapse;font-family:proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;width:600px;color:#4c4c4c;font-size:15px;line-height:150%;background:#ffffff;margin:40px 0;padding:0;border:0">
                <tbody>
                  <tr style="vertical-align:top;padding:0">
                    <td align="center" valign="top" style="vertical-align:top;padding:0 40px">
                      <table
                        style="border-spacing:0;border-collapse:collapse;font-family:proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;width:100%;background:#ffffff;margin:0;padding:0;border:0">
                        <tbody>
                          <tr style="vertical-align:top;padding:0">
                            <td style="vertical-align:top;text-align:left;padding:0" align="left" valign="top">
                              <h1
                                style="display:block;font-family:hybrea,proxima-nova,'helvetica neue',helvetica,arial,geneva,sans-serif;font-size:32px;font-weight:200;text-align:left;margin:0 0 40px"
                                align="left"><img
                                  src="data:image/png;base64,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"
                                  alt="bonapp" width="140" height="52" style="outline:none;text-decoration:none;border:0;margin-left: -15px;"
                                  class="CToWUd"></h1>
      
                              <p style="margin:20px 0">
                                Hola,
                                <br>
                                <br>
                                Gracias por registrarte en BonApp!
                                <br>
                                Por favor, confirmá la dirección de correo electónico ingresada durante el registro haciendo
                                click en el siguiente link:
                              </p>
      
                              <p style="margin:20px 0"><a
                                  href=${url}
                                  style="color:#6e5baa" target="_blank">${url}</a>
      
                              </p>
                              <p style="margin:20px 0">
                                Por cualquier consulta puedes contactarnos en:
                                <br>
                                soporte@bonapp.com.ar
                              </p>
      
      
                              <p style="margin:20px 0">
                                El equipo de BonApp<br>
                                <a href="https://bonapp.com.ar" style="color:#6e5baa" target="_blank">https://bonapp.com.ar</a>
                              </p>
                              <p></p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      `
    });
  }
  catch (err) {
    throw new Error(err.message);
  }
}

async function deleteOpenOrderByUserId(userId) {
  try {
    const user = await UserDAO.updateUserById(userId, { openOrder: null });
    console.log("orderService - deleteOpenOrderByUserId =>", user);
    return user;
  } catch (error) {
    throw new Error(err.message);
  }
}

async function accountVerification(token) {
  try {
    const decodedToken = jwt.verify(token, config.SECRET_TOKEN);
    let response;
    console.log("IAT: " + decodedToken.iat)
    console.log("MOMENT SUBTRACT: " + moment().subtract(12, 'hours').unix())
    if (decodedToken.iat > moment().subtract(12, 'hours').unix()) {
      const user = await UserDAO.getUserById(decodedToken.sub);
      if (user) {
        if (user.emailVerified) {
          response = {
            status: HttpStatus.BAD_REQUEST,
            message: `Este email ya ha sido verificado.`
          };
        } else {
          await UserDAO.updateUserById(user._id, { emailVerified: true });
          response = {
            status: HttpStatus.BAD_REQUEST,
            message: `La cuenta ha sido verificado, ya puede iniciar sesión.`
          };
        }
      } else {
        response = {
          status: HttpStatus.BAD_REQUEST,
          message: `No se ha encontrado ningún usuario para el token.`
        };
      }
    } else {
      response = {
        status: HttpStatus.BAD_REQUEST,
        message: `Su token ha expirado. Debe registrarse nuevamente.`
      };
    }

    return response;
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
  sendVerificationEmail,
  deleteOpenOrderByUserId
}