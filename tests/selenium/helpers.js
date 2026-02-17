/**
 * Selenium Test Helpers
 * Shared utility functions for all test suites
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('./config');

/**
 * Create and configure a WebDriver instance
 */
async function createDriver() {
    const options = new chrome.Options();

    if (config.HEADLESS) {
        options.addArguments('--headless=new');
    }

    options.addArguments(
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        `--window-size=${config.WINDOW_WIDTH},${config.WINDOW_HEIGHT}`,
        '--disable-extensions',
        '--disable-popup-blocking'
    );

    const driver = await new Builder()
        .forBrowser(config.BROWSER)
        .setChromeOptions(options)
        .build();

    await driver.manage().setTimeouts({
        implicit: config.TIMEOUT.IMPLICIT,
        pageLoad: config.TIMEOUT.PAGE_LOAD,
        script: config.TIMEOUT.SCRIPT,
    });

    return driver;
}

/**
 * Wait for an element to be visible and return it
 */
async function waitForElement(driver, locator, timeout = config.TIMEOUT.ELEMENT_WAIT) {
    return driver.wait(until.elementLocated(locator), timeout)
        .then(() => driver.wait(until.elementIsVisible(driver.findElement(locator)), timeout));
}

/**
 * Wait for an element to be clickable and click it
 */
async function clickElement(driver, locator, timeout = config.TIMEOUT.ELEMENT_WAIT) {
    const element = await waitForElement(driver, locator, timeout);
    await driver.wait(until.elementIsEnabled(element), timeout);
    await element.click();
    return element;
}

/**
 * Clear a field and type text into it
 */
async function clearAndType(driver, locator, text) {
    const element = await waitForElement(driver, locator);
    await element.clear();
    await element.sendKeys(text);
    return element;
}

/**
 * Wait for URL to contain a specific path
 */
async function waitForUrl(driver, urlPart, timeout = config.TIMEOUT.ELEMENT_WAIT) {
    await driver.wait(until.urlContains(urlPart), timeout);
}

/**
 * Wait for page to load (React SPA)
 */
async function waitForPageLoad(driver, timeout = config.TIMEOUT.SHORT_WAIT) {
    await driver.sleep(timeout);
}

/**
 * Navigate to a specific app path
 */
async function navigateTo(driver, path) {
    await driver.get(`${config.BASE_URL}${path}`);
    await waitForPageLoad(driver, 1000);
}

/**
 * Register a new user via the UI
 */
async function registerUser(driver, userData) {
    await navigateTo(driver, '/register');
    await waitForPageLoad(driver);

    await clearAndType(driver, By.id('name'), userData.name);
    await clearAndType(driver, By.id('email'), userData.email);
    await clearAndType(driver, By.id('password'), userData.password);
    await clearAndType(driver, By.id('confirmPassword'), userData.password);

    if (userData.phone) {
        await clearAndType(driver, By.id('phone'), userData.phone);
    }

    // Select role
    if (userData.role === 'vendor') {
        const roleSelect = await waitForElement(driver, By.id('role'));
        await roleSelect.sendKeys('Vendor');

        await driver.sleep(500); // Wait for vendor fields to appear

        if (userData.businessName) {
            await clearAndType(driver, By.id('businessName'), userData.businessName);
        }
        if (userData.serviceCategory) {
            const catSelect = await waitForElement(driver, By.id('serviceCategory'));
            await catSelect.sendKeys(userData.serviceCategory);
        }
        if (userData.businessDescription) {
            await clearAndType(driver, By.id('businessDescription'), userData.businessDescription);
        }
    }

    // Submit form
    await clickElement(driver, By.css('.auth-submit'));
    await driver.sleep(2000); // Wait for registration/redirect
}

/**
 * Login via the UI
 */
async function loginUser(driver, email, password) {
    await navigateTo(driver, '/login');
    await waitForPageLoad(driver);

    await clearAndType(driver, By.id('email'), email);
    await clearAndType(driver, By.id('password'), password);

    await clickElement(driver, By.css('.auth-submit'));
    await driver.sleep(2000); // Wait for login/redirect
}

/**
 * Logout via navbar
 */
async function logoutUser(driver) {
    try {
        await clickElement(driver, By.css('.nav-logout'));
        await driver.sleep(1000);
    } catch (e) {
        // Fallback: navigate to home
        await navigateTo(driver, '/');
    }
}

/**
 * Check if an element exists on the page
 */
async function elementExists(driver, locator, timeout = 2000) {
    try {
        await driver.wait(until.elementLocated(locator), timeout);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get text of an element safely
 */
async function getElementText(driver, locator, timeout = config.TIMEOUT.ELEMENT_WAIT) {
    try {
        const element = await waitForElement(driver, locator, timeout);
        return await element.getText();
    } catch {
        return null;
    }
}

/**
 * Select a dropdown value
 */
async function selectDropdown(driver, locator, value) {
    const select = await waitForElement(driver, locator);
    const options = await select.findElements(By.tagName('option'));
    for (const option of options) {
        const text = await option.getText();
        if (text.toLowerCase().includes(value.toLowerCase())) {
            await option.click();
            return;
        }
    }
}

/**
 * Take a screenshot for debugging
 */
async function screenshot(driver, name) {
    const image = await driver.takeScreenshot();
    const fs = require('fs');
    const dir = './screenshots';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(`${dir}/${name}_${Date.now()}.png`, image, 'base64');
}

/**
 * Get the current page title
 */
async function getPageTitle(driver) {
    return driver.getTitle();
}

/**
 * Count elements matching a locator
 */
async function countElements(driver, locator) {
    try {
        const elements = await driver.findElements(locator);
        return elements.length;
    } catch {
        return 0;
    }
}

module.exports = {
    createDriver,
    waitForElement,
    clickElement,
    clearAndType,
    waitForUrl,
    waitForPageLoad,
    navigateTo,
    registerUser,
    loginUser,
    logoutUser,
    elementExists,
    getElementText,
    selectDropdown,
    screenshot,
    getPageTitle,
    countElements,
    By,
    until,
    Key,
};
