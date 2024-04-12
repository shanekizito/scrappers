const puppeteer = require('puppeteer-core');
const fs = require('fs');
const xlsx = require('xlsx'); // Add xlsx library for Excel file handling

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

const processUsernames = async (usernames) => {
  for (const username of usernames) {
    const urlLink = `https://twitter.com/${username}`;
    try {
      const profileData = await getTwitterData(urlLink);
      const jsonData = JSON.stringify(profileData, null, 2);
      fs.writeFileSync(`${username}_twitter_data.json`, jsonData);
      console.log(`Data for ${username} saved to ${username}_twitter_data.json`);
    } catch (error) {
      console.error(`Error fetching data for ${username}:`, error);
    }
  }
};

// Load Excel file and extract usernames from the 4th column (column D), excluding the first row
const workbook = xlsx.readFile('usernames.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const usernames = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) // Convert sheet to JSON
  .map(row => row[3] && row[3].replace('@', '')) // Extract usernames from 4th column, remove '@' if present
  .filter((username, index) => username && index !== 0); // Remove any empty usernames and skip the first row
console.log(usernames);
processUsernames(usernames).then(() => {
  console.log('All user data processed successfully.');
}).catch(error => {
  console.error('Error processing user data:', error);
});
