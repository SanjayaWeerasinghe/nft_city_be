// const nodeMailer = require('nodemailer')
// const config = require('../config')
// const { constant } = require('../constants/constant')


// module.exports = {
//     mailOptions(to, subject, html) {

//         return {
//             from: `"${constant.website_info.name}" <${config.EMAIL_SENDER}>`, // sender address
//             to: to, // list of receivers
//             subject: subject, // Subject line
//             html: html //html body
//         }
//     },
//     transporter: nodeMailer.createTransport({
//         host: config.EMAIL_HOST,
//         port: config.EMAIL_PORT,
//         secure: false, // Use TLS for port 2525
//         auth: {
//             user: config.EMAIL_USER, // generated ethereal user
//             pass: config.EMAIL_PASS, // generated ethereal password
//         },
//         tls: {
//             rejectUnauthorized: false // Allow self-signed certificates
//         }
//     }),
// }


const nodeMailer = require('nodemailer')
const config = require('../config')
const mailgunTransport = require('nodemailer-mailgun-transport')


const mailgunOptions = {
    auth: {
        api_key: config.MAILGUN_API_KEY,
        domain: config.MAILGUN_API_DOMAIN
    }
}

const transport = mailgunTransport(mailgunOptions)

module.exports = {
    mailOptions(to, subject, html) {
      
        return {
            from: config.USER, // sender address
            to: to, // list of receivers
            subject: subject,
            html: html //html body
        }
    },
    transporter: nodeMailer.createTransport(transport),
}


