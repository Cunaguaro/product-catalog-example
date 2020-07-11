
/**
 * A Lambda function that sends emails
 */

// const aws = require('aws-sdk');
// const s3 = new aws.S3();

var fs = require('fs');
var path = require('path');
// const pdf = require('./pdf');
// const sqs = require('./awsSQS');
const email = require('./email');


exports.sendProductCatalog = async (event) => {

    const prossessEmailQueue = new Promise((resolve, reject) => {
        event.Records.forEach(async record => {
          const { body } = record;
          const data = JSON.parse(body);
          // var contents = fs.readFileSync(`public${path.sep}email_${data.lang}.html`);
          const htmlstream = fs.createReadStream(`public${path.sep}email_${data.lang}.html`);
          const emailData = { email: data.email, htmlstream: htmlstream, attachment: data.fileName }
          const result = email.SendEmail(emailData)
            .then(result => resolve(result));
        });
      })
      await prossessEmailQueue;
}
