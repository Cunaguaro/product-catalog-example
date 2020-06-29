
const pdfKit = require('pdfkit')
const fs = require('fs')
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var generatePDF = async jsonObj => {
    const fileName = await buildDocument(jsonObj).then(fileName => fileName, error => { throw (error) })
    await Save_PDF_S3(fileName).then(result => console.log(result), error => { throw (error) })
    await Save_Log_S3(`${fileName}.log`, jsonObj).then(result => console.log(result), error => { throw (error) })
    return fileName;
}
const buildDocument = (jsonObj) => {
    // this generate the pdf
    var getDocument = function (resolve, reject) {
        try {
            var pdf = new pdfKit({ // eslint-disable-line
                size: 'LETTER', // See other page sizes here: https://github.com/devongovett/pdfkit/blob/d95b826475dd325fb29ef007a9c1bf7a527e9808/lib/page.coffee#L69
                layout: 'portrait',
                info: {
                    Title: 'Pitch of Sales',
                    Author: 'IHL'
                },
                margins: {
                    top: 50,
                    bottom: 10,
                    left: 20,
                    right: 20
                }
            })
            const fileName = jsonObj.userData.email + '-' + new Date().getHours() + '-' + new Date().getMinutes() + '-' + new Date().getSeconds();
            const pdfName = fileName + '.pdf'
            // const logName = fileName + '.txt'
            let stream = fs.createWriteStream("/tmp/" + pdfName);
            pdf.pipe(stream);

            pdf.fillColor('red')
            // Write stuff into PDF
            pdf.fontSize(10)
            // Page 1
            // pdf.image(`./assets/reports/pdf/sales_pitch/pitch-de-ventas-page_1_${jsonObj.userData.lang}.jpg`, 0, 0, { width: 612 })
            // Page 2
            pdf.addPage()
            // pdf.image(`./assets/reports/pdf/sales_pitch/pitch-de-ventas-page_2_${jsonObj.userData.lang}.jpg`, 0, 0, { width: 612 })
            // Strengths

            pdf.text(jsonObj.userData.subject, 35, 180, { width: 180 })
            pdf.text(jsonObj.userData.message, 35, 200, { width: 180 })


            pdf.end()

            stream.on("finish", function () {
                resolve(pdfName)
            });



        } catch (error) {
            reject(error.message)
        }
    }

    return new Promise(getDocument)
}

Save_PDF_S3 = (pdfName) => {
    var saveFileS3 = function (resolve, reject) {
        // get the file size
        // console.log('## Save_PDF_S3-> ENVIRONMENT VARIABLES WEBSITE_S3_BUCKET: ' + (process.env.WEBSITE_S3_BUCKET));
        const stats = fs.statSync("/tmp/" + pdfName);
        s3.putObject({
            Bucket: process.env.WEBSITE_S3_BUCKET,
            Key: 'pdf/' + pdfName,
            Body: fs.createReadStream("/tmp/" + pdfName),
            ContentType: "application/pdf",
            ContentLength: stats.size,
        }, function (err) {
            if (err) {
                // console.log("saveFileS3->ERROR", err.message);
                reject(err.stack)
            } else {
                resolve("put PDF on S3 done " + pdfName)
            }
        });
    }
    return new Promise(saveFileS3);
}
Save_Log_S3 = (logName, jsonObj) => {

    var saveFileS3 = function (resolve, reject) {
        s3.putObject({
            Bucket: process.env.WEBSITE_S3_BUCKET,
            Key: 'logs/' + logName,
            Body: JSON.stringify(jsonObj),
            ContentType: "text/plain",
        }, function (err) {
            if (err) {
                reject(err.stack)
            } else {
                resolve("put LOG on S3 done " + logName)
            }
        });
    }
    return new Promise(saveFileS3);
}
module.exports = {
    generatePDF
}
