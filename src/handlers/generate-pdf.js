
'use strict';
const aws = require('aws-sdk');
const s3 = new aws.S3();

var fs = require('fs');
var path = require('path');
const pdf = require('./pdf');
const sqs = require('./awsSQS');
// const email = require('./email');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
exports.generatePDF = async (event, context) => {

    let result = {
      statusCode: 0,
      body: "",
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'content-type': 'application/json'
      }
    };
  
    try {
      const body = JSON.parse(event.body)
  
      // generate a .pdf and save it in S3
      const fileName = await pdf.generatePDF(body)
        .then((fileName) => {
          return fileName
        }, err => { throw (err) });
  
      // generate a queue for send a email 
      const SQSresult = await sqs.sendSQSMenssage({ email: body.userData.email, lang: body.userData.lang, fileName })
        .then((result) => {
          return result;
        }, err => { throw (err) });
  
      // response to client 
      result.statusCode = 200;
      result.body = JSON.stringify({ status: "OK", fileName });
      return result;
  
    } catch (error) {
      console.log("ERROR",error);
      result.statusCode = 500;
      result.body =JSON.stringify(error);
      return result;
    }
  
  };