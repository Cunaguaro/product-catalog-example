const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

exports.sendSQSMenssage = async (data) => {
    
    const queueUrl = process.env.EMAIL_SQS;
    const sqsOrderData = {
        MessageAttributes: {
            "email": {
                DataType: "String",
                StringValue: data.email
            },
            "lang": {
                DataType: "String",
                StringValue: data.lang
            },
            "fileName": {
                DataType: "String",
                StringValue: data.fileName
            }
        },
        MessageBody: JSON.stringify(data),
        QueueUrl: queueUrl
    };
    const sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
    const result = await sendSqsMessage.then((result) => {
        console.log(`OrdersSvc | SUCCESS: ${result.MessageId}`);
        return result;
    },err => { throw(err)} ).catch((err) => {
        console.log(`OrdersSvc | ERROR: ${err}`);
        return err;
    });
    return result;
}
