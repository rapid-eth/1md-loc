require('dotenv')
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const geoip = require('geoip-lite');
const cors = require('cors')({
  origin: true,   // reflect request origin
});
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');

const serviceAccount = require('./service_accounts/geoip-f708b-firebase-adminsdk-fm042-a1fe0b6417.json');
admin.initializeApp(functions.config({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://geoip-f708b.firebaseio.com"
}).firebase);

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

exports.axiosPull = functions.https.onRequest(async (request, response) => {
  const ref = admin.database().ref('data')
  ref.set({a: Date.now()})

  try {
    const res = await axios("https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&page=900&text=ethereum&radius=global&photo-host=public&page=900&text=ethereum&radius=global", {"credentials":"include","headers":{"accept":"application/json, text/javascript, */*; q=0.01","accept-language":"en-US,en-US,en;q=0.9","cache-control":"no-cache","content-type":"application/x-www-form-urlencoded; charset=UTF-8","csrf-token":"1174e0d4-7db7-4984-98d1-d8e3ff19a634","pragma":"no-cache","sec-fetch-dest":"empty","sec-fetch-mode":"cors","sec-fetch-site":"same-site","x-meetup-agent":"app_name=\"Desktop-Web\"","x-meta-photo-host":"public","x-meta-stringify-ids":"true"},"referrer":"https://secure.meetup.com/meetup_api/console/?path=/find/upcoming_events","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"}).then(response => response.data);
    console.log(res);
    response.sendStatus(200);
  } catch (e) {
    console.error(e)
  }
});

exports.curlPull = functions.https.onRequest((request, response) => {
  async function invokeCurl() {
    try {
        const curlCommand = "curl -s 'https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&page=900&text=ethereum&radius=global&photo-host=public&page=900' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3985.3 Safari/537.36' -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' -H 'accept: application/json, text/javascript, */*; q=0.01' -H 'csrf-token: 1174e0d4-7db7-4984-98d1-d8e3ff19a634' -H 'sec-fetch-dest: empty' -H 'x-meta-stringify-ids: true' -H 'x-meta-photo-host: public' -H 'origin: https://secure.meetup.com' -H 'sec-fetch-site: same-site' -H 'sec-fetch-mode: cors' -H 'referer: https://secure.meetup.com/meetup_api/console/?path=/find/upcoming_events' -H 'cookie: __ssid=3cfdf1f1c3f73ad3975904a9657ed9d; memberId=297877779; MEETUP_CSRF=1174e0d4-7db7-4984-98d1-d8e3ff19a634; MEETUP_MEMBER=\"id=297877779&status=1&timestamp=1575511414&bs=0&tz=Europe%2FBerlin&zip=meetup1&country=de&city=Berlin&state=&lat=52.52&lon=13.38&ql=false&s=93221a47cd2b9b28fa49d59fd52dd600bad3dd6e&scope=ALL&rem=1\";'"
        const { stdout, stderr } = await exec(curlCommand, (error, stdout, stderr) => {
          console.log('stdout', stdout)
          const ref = admin.database().ref("data");
          ref.set(stdout)
        });
        console.log('returned stdout:', stdout);
        console.log('returned stderr:', stderr);
        response.sendStatus(200)
    } catch (err) {
       console.error(err);
    }
  }
  invokeCurl();
});

