const functions = require('firebase-functions');
const util = require('util');
const geoip = require('geoip-lite');

exports.loc = functions.https.onRequest((request, response) => {
  const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  const headers = JSON.stringify(request.headers, null, 2);
  const geo = geoip.lookup(ipAddress);
  const geoStr = JSON.stringify(geo);
  const message = util.format("<pre>Your IP address: %s\n\nRequest headers: %s\n\nGeoIP: %s</pre>", ipAddress, headers, geoStr);
  response.send(message);
});
