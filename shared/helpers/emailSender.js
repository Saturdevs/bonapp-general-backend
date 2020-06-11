'use strict'
const nodemailer = require("nodemailer");

/**
 * Función para el envío de mails.
 * @param {JSON} email email a ser enviado.
 */
async function sendEmail(email) {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    //TODO: cambiar por un servidor smtp real, o ver algún paquete de npm que pueda llegar a servir
    //como transport. Ver Sendgrid (https://sendgrid.com/)
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail(email);

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  sendEmail
}