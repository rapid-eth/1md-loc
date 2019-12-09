const functions = require('firebase-functions');
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

exports.debug = functions.https.onRequest((request, response) => {
  // intended for local debugging; not configured for CORS
  const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  const headers = JSON.stringify(request.headers, null, 2);
  const geo = geoip.lookup(ipAddress);
  const geoStr = JSON.stringify(geo);
  const message = util.format("<pre>Your IP address: %s\n\nRequest headers: %s\n\nGeoIP: %s</pre>", ipAddress, headers, geoStr);
  response.send(message);
});