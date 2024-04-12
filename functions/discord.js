const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function clickElement(driver, element) {
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });", element);
    await driver.executeScript("arguments[0].click();", element);
}

async function runBot() {
    let options = new chrome.Options();
    // options.addArguments('--headless'); // Run Chrome in headless mode (without GUI)

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.get('https://solanart.io/collections');

        await driver.wait(until.elementLocated(By.css('.gap-3 [style*="display: block;"]')), 10000);

        let collectionItems = await driver.findElements(By.css('.gap-3 [style*="display: block;"]'));

        await Promise.all(collectionItems.map(item => item.isDisplayed()));

        let lastIndexClicked = -1; // Keep track of the last clicked collection item index

        for (let i = 0; i < collectionItems.length; i++) {
            // Skip if this collection item has been clicked previously
            if (i <= lastIndexClicked) continue;

            await clickElement(driver, collectionItems[i]);

            await driver.wait(until.elementLocated(By.className('flex gap-4 self-end')), 10000);

            let links = await driver.findElements(By.css('a[href^="https://www.discord.gg/"]'));
            if (links.length > 0) {
                console.log("Links found on collection page:", links.length);
                for (let link of links) {
                    console.log(await link.getAttribute('href'));
                }
            } else {
                console.log("No links found on collection page, navigating back to collections.");
            }

            // Set the index of the last clicked collection item
            lastIndexClicked = i;

            // Wait for the collections page to be loaded completely after navigating back
            await driver.wait(until.elementLocated(By.css('.gap-3 [style*="display: block;"]')), 10000);
        }

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await driver.quit();
    }
}

runBot();
