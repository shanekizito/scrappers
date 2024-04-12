const puppeteer = require('puppeteer-core');
const fs = require('fs');

const BROWSERLESS_API_KEY = 'b69af49a-12ec-4b82-8aa7-cfa0c021566d';

const getTwitterData = async (url) => {
  const _browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`
  });
  const _page = await _browser.newPage();
  await _page.goto(url);
  await _page.waitForSelector(`div.css-175oi2r`);
    
  const profileData = await _page.evaluate(() => {
    const profileName = document.querySelector('div.css-175oi2r [data-testid="UserName"] div span').innerText;
    const username = document.querySelector('div.css-175oi2r[data-testid="UserName"] div:nth-of-type(2) span').innerText;
    const descriptionElement = document.querySelector('div.css-175oi2r [data-testid="UserDescription"]');
    const urlElement = document.querySelector('div.css-175oi2r [data-testid="UserUrl"]');
    const url = urlElement.innerText
    const description = descriptionElement.innerText;

    const startString = "Verification:";
    const startIndex = description.indexOf(startString);
    const linkText = description.substring(startIndex + startString.length);
    const link = linkText.split('\n')[0];

    const startHttpIndex = description.indexOf('http');
    const endHttpIndex = description.indexOf('\n', startHttpIndex);
    const descriptionAfterLink = description.substring(startHttpIndex, endHttpIndex);
    


    return {
      User: {
        profileName,
        username,
        description: description,
    
      },
      Links: [{
        label: url,
        url: link
      }]
    };
  });

  _browser.disconnect();

  return profileData;
};

const urlLink = "https://twitter.com/zyecx7";

getTwitterData(urlLink).then(profileData => {
  const jsonData = JSON.stringify(profileData, null, 2);
  fs.writeFileSync('twitter_data.json', jsonData);
  console.log('Data saved to twitter_data.json');
}).catch(error => {
  console.error('Error:', error);
});
