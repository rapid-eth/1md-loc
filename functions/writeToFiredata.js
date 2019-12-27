const admin = require('firebase-admin');

const serviceAccount = require('./service_accounts/geoip-f708b-firebase-adminsdk-fm042-a1fe0b6417.json');
const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://geoip-f708b.firebaseio.com"
});

const writeToFiredata = async (data) => {
  try {
    const parsedData = JSON.parse(data);
    const database = firebaseAdmin.database();
    const ref = database.ref();
    ref.set(parsedData)
  } catch (e) {
    console.error(e)
  }
}

exports.writeToFiredata = writeToFiredata;