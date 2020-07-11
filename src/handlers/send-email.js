
/**
 * A Lambda function that sends emails
 */


exports.sendProductCatalog = async (event) => {

    console.log(event)
    try {
        result = {
            statusCode: 200,
            body: "hola from send email",
            headers: { 'content-type': 'text/html' }
        };

    } catch (error) {
        result = {
            statusCode: 500,
            body: error.toString(),
            headers: { 'content-type': 'text/html' }
        };
    }
    return result
}
