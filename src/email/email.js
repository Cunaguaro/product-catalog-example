const nodemailer = require('nodemailer')
var AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs')

var SendEmail = async emailData => {

    const fileData = await get_S3_file(emailData).then(result => result, error => error)
    const result = await buildEmail(emailData, fileData).then(result => result, error => error);
    console.log("SendEmail END")
    return result;
}

const get_S3_file = (emailData) => {
    const getFile = function (resolve, reject) {
        const Bucket = process.env.WEBSITE_S3_BUCKET;
        const Key = 'pdf/' + emailData.attachment;
        s3.getObject({ Bucket, Key }).promise().then((fileData => {
            resolve(fileData)
        }), error => reject(error));

    }
    return new Promise(getFile)
}

var buildEmail = async (emailData, fileData) => {
    const send = async (resolve, reject) => {
        const filePath = '/tmp/' + emailData.attachment
        console.log(fileData)
        console.log("SendEmail ->")
        let transporter = nodemailer.createTransport({
            host: 'email-smtp.us-west-2.amazonaws.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // generated ethereal user
                pass: process.env.SMTP_PASS // generated ethereal password
            }
        })
        // setup email data with unicode symbols
        fs.writeFile(filePath, fileData.Body, result => {
            let mailOptions = {
                from: '"cunaguaro" <no-reply@cunaguaro.net>', // sender address
                to: emailData.email, // list of receivers
                subject: 'Product Catalog ✔', // Subject line
                text: 'Product Catalog', // plain text body
                html: emailData.htmlstream, // html body
                attachments: [
                    {
                        // filename and content type is derived from path
                        path: filePath
                    }
                ]
            }
            // send mail with defined transport object
            transporter.sendMail(mailOptions).then((result) => {

                resolve(result)
            }, error => reject(error))
        })
    };
    return new Promise(send)
}

module.exports = { SendEmail }
