const functions = require('firebase-functions');
// const util = require('util');
const geoip = require('geoip-lite');
const cors = require('cors')({
  origin: true,   // reflect request origin
});

exports.loc = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const geo = geoip.lookup(ipAddress);
    const geoStr = JSON.stringify(geo);
    response.send(geoStr);
  })
});