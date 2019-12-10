const functions = require('firebase-functions');
const cheerio = require('cheerio');
const axios = require('axios');

const { MEETUP_LOGIN, MEETUP_PASSWORD } = process.env;

// tell axios to capture cookies
axios.defaults.withCredentials = true;

functions.https.onRequest((request, response) => {
  const rawLogin = async () => {
    const loginPage = await axios.get('https://secure.meetup.com/login/').then(response => response.data)
    // TODO, capture cookies!
    const token = cheerio.load(loginPage)('#loginForm input[name=token]').val()
    // 
    const loginResponse = await axios.post('https://secure.meetup.com/login/', {
      email: MEETUP_LOGIN,
      password: MEETUP_PASSWORD,
      token
    }).then(response => response)
    console.log('loginResponse', loginResponse);

  };
  const myResponse = rawLogin();
  console.log(myResponse);
  response.send(myResponse);
});