const puppeteer = require('puppeteer');

const BROWSERLESS_API_KEY = 'e0fbaff9-bdbb-4c80-afd4-6580b99373dc';

async function searchTwitterUsername(username) {
    const _browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`
    });

    const page = await _browser.newPage();

    try {
        // Navigate to Twitter search page
        await page.goto(`https://twitter.com/search?q=${encodeURIComponent(username)}&src=typed_query`);
        
        // Wait for the search results to load
        await page.waitForSelector(`div.css-175oi2r`);
        
        // Extract usernames from the search results
        const usernames = await page.evaluate(() => {
            const usernameElements = document.querySelectorAll('span.css-1qaijid');
            const usernames = Array.from(usernameElements).map(element => element.textContent);
            return usernames;
        });

        await _browser.close();

        return usernames;
    } catch (error) {
        console.error('An error occurred while searching for the username:', error);
        await _browser.close();
        return [];
    }
}

async function main() {
    const username = '手押し CH'; // Change this to the username you want to search for
    const usernames = await searchTwitterUsername(username);

    if (usernames.length > 0) {
        // Output each username
        usernames.forEach((username, index) => {
            console.log(`Username ${index + 1}: ${username}`);
        });
    } else {
        console.log('No usernames found for the specified username.');
    }
}

main().catch(error => console.error(error));
