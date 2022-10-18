var nodemailer = require('nodemailer');
// const { ConnectionPolicyInstance } = require('twilio/lib/rest/voice/v1/connectionPolicy');
const DBconnection = require('../../config/databaseConfig')

let sendEmail = (subject, body, recipient) => {
  return new Promise(async (resolve, reject) => {
    try {
      conn = DBconnection()
      conn.query('SELECT * FROM dbo_settings WHERE name = "smtp_settings"', (error, data) => {
        if (error) {
          const DBERROR = 'THERE WAS A DB ERROR'
          reject(DBERROR)
        } else {
          if (data[0].host === null) {
            const err = 'There is no Host configuration'
            reject(err)
          }
        }
        const smtp_info = data[0]  
        var transporter = nodemailer.createTransport({
          host: smtp_info.host,
          port: smtp_info.port,
          secure: smtp_info.secure,
          requireTLS: smtp_info.require_tls,
          auth: {
            user: smtp_info.user,
            pass: smtp_info.pass
          }
        })
        var mailOptions = {
          from: process.env.FROM_EMAIL,
          to: recipient,
          subject: subject,
          html: body,
        }
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            reject(err)
          } else {
            const mailStatus = 'Email Sent'
            resolve(mailStatus)
          }
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  sendEmail: sendEmail,
}
