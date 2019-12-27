const puppeteer = require('puppeteer');
const { MEETUP_LOGIN, MEETUP_PASSWORD } = process.env;

const { writeToFiredata } = require('./writeToFiredata');

const update = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // By default Puppeteer uses a user agent including "HeadlessChrome" - override
  page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4003.0 Safari/537.36')
  
  // Listen for and filter responses for AJAX ones, b/c our only AJAX call should hopefully be one of the only ones happening
  // Native Nodejs EventEmitters, which Puppeteer extends, should be configured in advance of imperative actions
  page.on('response', async response => {
    const url = response.url();
    const status = response.status()

    // detect if we may have been rate limited. TODO: tighten up to better avoid false positives
    if ((!url.match('facebook')) && (status >= 300) && (status <= 399)) {
      console.warn('Redirected from', url, 'to', response.headers()['location'])
      console.warn(`Redirection may indicate we're hitting auth rate limiting. Consider performing a manual login using ${MEETUP_LOGIN}`)
    }

    if (response.request().resourceType() === 'xhr') {
      console.log('url was', url)
      console.log('status was', status)

      const buffer = await response.buffer();
      console.log('buffer', buffer);
      try {
        const parsedJSON = buffer.toString();
        if (parsedJSON) {
          writeToFiredata(parsedJSON);
        }
      } catch (err) {
        console.error(`Failed parsing data from: ${url}`);
        console.error(err);
      }
    }
  });

  await page.goto('https://secure.meetup.com/login');
  await page.type('#email', MEETUP_LOGIN);
  await page.type('#password', MEETUP_PASSWORD);
  await page.click('#loginFormSubmit');
  
  await page.goto('https://secure.meetup.com/meetup_api/console/?path=/find/upcoming_events', { waitUntil: 'networkidle0' });
  // if we don't have a <form> on this page, logging in failed. bail.
  const loggedIn = await page.evaluate(() => document.querySelector('#console-form'));
  if (!loggedIn) {
    throw new Error('not logged in')
  }
  
  await page.type('[name="page"]', '900');
  await page.type('[name="text"]', 'ethereum');
  await page.type('[name="radius"]', 'global');
  await page.click('#show-response');

  await page.waitForSelector('#response:not(:empty)');

  await page.close();
  await browser.close();
}

exports.update = update