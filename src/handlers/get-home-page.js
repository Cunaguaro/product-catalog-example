
/**
 * A Lambda function that returns a static html page
 */
var fs = require('fs');
var path = require('path');

exports.getHomePageHandler = async (event) => {
    try {
        result = {
            statusCode: 200,
            body: fs.readFileSync(`public${path.sep}index.html`).toString(),
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
