const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function clickCollectionItem(driver, altText) {
    // Locate the collection item by alt text of the image
    const collectionItem = await driver.findElement(By.xpath(`//img[@alt='${altText}']/ancestor::div[contains(@class, 'group')]`));
    // Scroll to the collection item
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });", collectionItem);
    // Click on the collection item
    await driver.executeScript("arguments[0].click();", collectionItem);
}

async function checkLinks(driver) {
    // Wait for links to load
    await driver.wait(until.elementLocated(By.css('a[href^="https://www.discord.gg/"]')), 10000);
    // Find all links
    const links = await driver.findElements(By.css('a[href^="https://www.discord.gg/"]'));
    if (links.length > 0) {
        console.log("Links found on collection page:", links.length);
        for (let link of links) {
            console.log(await link.getAttribute('href'));
        }
    } else {
        console.log("No links found on collection page, navigating back to collections.");
    }
}

async function runBot() {
    let options = new chrome.Options();
    // options.addArguments('--headless'); // Run Chrome in headless mode (without GUI)

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.get('https://solanart.io/collections');

        await driver.wait(until.elementLocated(By.css('.gap-3 [style*="display: block;"]')), 10000);

        let collectionItems = await driver.findElements(By.css('.gap-3 [style*="display: block;"]'));

        for (let i = 0; i < collectionItems.length; i++) {
            const altText = await collectionItems[i].findElement(By.tagName('img')).getAttribute('alt');
            await clickCollectionItem(driver, altText);

            await driver.wait(until.elementLocated(By.className('flex gap-4 self-end')), 10000);

            await checkLinks(driver);

            await driver.navigate().back();

            await driver.wait(until.elementLocated(By.css('.gap-3 [style*="display: block;"]')), 10000);
            collectionItems = await driver.findElements(By.css('.gap-3 [style*="display: block;"]'));
        }

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await driver.quit();
    }
}

runBot();
