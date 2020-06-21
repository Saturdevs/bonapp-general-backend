'use strict'
const nodemailer = require("nodemailer");
const config = require('../../config');

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
    let transporter = nodemailer.createTransport({
      host: "smtp.bonapp.com.ar",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: config.USER_EMAIL,
        pass: config.USER_PASSWORD, 
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail(email);

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  sendEmail
}