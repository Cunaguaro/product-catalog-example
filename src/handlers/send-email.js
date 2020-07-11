
/**
 * A Lambda function that sends emails
 */


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
