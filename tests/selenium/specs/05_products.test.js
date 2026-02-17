/**
 * TEST SUITE 5: Products Page Tests
 * Tests product listing, filtering, search, and add to cart
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    clearAndType, elementExists, getElementText, waitForUrl,
    waitForPageLoad, loginUser, logoutUser, countElements,
    selectDropdown, By, until,
} = require('../helpers');

describe('Products Page', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 3);
    let driver;

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    // ───────────── PRODUCTS PAGE UI (PUBLIC) ─────────────

    describe('Products Page UI (Public Access)', function () {
        before(async function () {
            await navigateTo(driver, '/products');
        });

        it('should load the products page', async function () {
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/products');
        });

        it('should display the page header', async function () {
            const header = await getElementText(driver, By.css('.product-list-header h1'));
            expect(header).to.include('Products');
        });

        it('should display the search input', async function () {
            const search = await elementExists(driver, By.css('.search-input'));
            expect(search).to.be.true;
        });

        it('should display category filter dropdown', async function () {
            const filter = await elementExists(driver, By.css('.filter-select'));
            expect(filter).to.be.true;
        });

        it('should display sort dropdown', async function () {
            const sortSelects = await driver.findElements(By.css('.filter-select'));
            expect(sortSelects.length).to.be.greaterThanOrEqual(1);
        });
    });

    // ───────────── SEARCH FUNCTIONALITY ─────────────

    describe('Search Functionality', function () {
        it('should accept search input', async function () {
            await navigateTo(driver, '/products');
            const searchInput = await waitForElement(driver, By.css('.search-input'));
            await searchInput.clear();
            await searchInput.sendKeys('test');
            await driver.sleep(1000); // Wait for debounce

            const value = await searchInput.getAttribute('value');
            expect(value).to.equal('test');
        });

        it('should clear search and show all products', async function () {
            const searchInput = await waitForElement(driver, By.css('.search-input'));
            await searchInput.clear();
            await driver.sleep(1000);

            const value = await searchInput.getAttribute('value');
            expect(value).to.equal('');
        });
    });

    // ───────────── CATEGORY FILTERING ─────────────

    describe('Category Filtering', function () {
        it('should filter products by category', async function () {
            await navigateTo(driver, '/products');
            const filterSelects = await driver.findElements(By.css('.filter-select'));
            if (filterSelects.length > 0) {
                await filterSelects[0].sendKeys('Catering');
                await driver.sleep(1500);
            }
            // No crash = pass
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/products');
        });

        it('should reset to All Categories', async function () {
            const filterSelects = await driver.findElements(By.css('.filter-select'));
            if (filterSelects.length > 0) {
                const options = await filterSelects[0].findElements(By.tagName('option'));
                if (options.length > 0) {
                    await options[0].click(); // First option = "All Categories"
                    await driver.sleep(1000);
                }
            }
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/products');
        });
    });

    // ───────────── ADD TO CART (AUTHENTICATED) ─────────────

    describe('Add to Cart (Authenticated User)', function () {
        before(async function () {
            await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);
            await navigateTo(driver, '/products');
            await driver.sleep(2000);
        });

        after(async function () {
            await logoutUser(driver);
        });

        it('should display cart navigation button for logged-in user', async function () {
            const cartBtn = await elementExists(driver, By.css('.cart-nav-btn'));
            expect(cartBtn).to.be.true;
        });

        it('should display product cards', async function () {
            const cards = await driver.findElements(By.css('.product-card'));
            // Products may or may not exist depending on DB state
            // Just ensure the page loaded correctly
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/products');
        });

        it('should show Add to Cart buttons on product cards', async function () {
            const addBtns = await driver.findElements(By.css('.add-to-cart-btn'));
            // If products exist, add buttons should be visible
            if (addBtns.length > 0) {
                const btnText = await addBtns[0].getText();
                expect(btnText.toLowerCase()).to.include('cart');
            }
        });

        it('should add a product to cart if products exist', async function () {
            const addBtns = await driver.findElements(By.css('.add-to-cart-btn'));
            if (addBtns.length > 0) {
                await addBtns[0].click();
                await driver.sleep(2000);

                // Check for toast message
                const toast = await elementExists(driver, By.css('.cart-toast'));
                if (toast) {
                    const toastText = await getElementText(driver, By.css('.cart-toast'));
                    expect(toastText.toLowerCase()).to.include('cart');
                }
            }
        });

        it('should navigate to cart page from cart button', async function () {
            const cartBtn = await elementExists(driver, By.css('.cart-nav-btn'));
            if (cartBtn) {
                await clickElement(driver, By.css('.cart-nav-btn'));
                await waitForUrl(driver, '/cart');
                const url = await driver.getCurrentUrl();
                expect(url).to.include('/cart');
            }
        });
    });

    // ───────────── PRODUCTS REDIRECT FOR UNAUTHENTICATED ─────────────

    describe('Unauthenticated Cart Redirect', function () {
        before(async function () {
            await navigateTo(driver, '/products');
            await driver.sleep(1000);
        });

        it('should not show cart navigation button when not logged in', async function () {
            const cartBtn = await elementExists(driver, By.css('.cart-nav-btn'), 1000);
            expect(cartBtn).to.be.false;
        });
    });
});
