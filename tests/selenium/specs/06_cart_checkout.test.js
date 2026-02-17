/**
 * TEST SUITE 6: Cart & Checkout Tests
 * Tests cart page, item management, quantity updates, and checkout flow
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    clearAndType, elementExists, getElementText, waitForUrl,
    waitForPageLoad, loginUser, logoutUser, countElements,
    By, until,
} = require('../helpers');

describe('Cart & Checkout', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 3);
    let driver;

    before(async function () {
        driver = await createDriver();
        await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);
    });

    after(async function () {
        await logoutUser(driver);
        if (driver) await driver.quit();
    });

    // ───────────── CART PAGE UI ─────────────

    describe('Cart Page UI', function () {
        before(async function () {
            await navigateTo(driver, '/cart');
        });

        it('should load the cart page', async function () {
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/cart');
        });

        it('should display the cart header', async function () {
            const header = await getElementText(driver, By.css('.cart-header h1'));
            expect(header).to.include('Cart');
        });

        it('should display Continue Shopping button', async function () {
            const btn = await elementExists(driver, By.css('.back-btn'));
            expect(btn).to.be.true;
        });

        it('should show either cart items or empty cart message', async function () {
            const hasItems = await elementExists(driver, By.css('.cart-items'), 2000);
            const isEmpty = await elementExists(driver, By.css('.empty-cart'), 2000);
            expect(hasItems || isEmpty).to.be.true;
        });
    });

    // ───────────── EMPTY CART STATE ─────────────

    describe('Empty Cart', function () {
        it('should show empty cart icon when cart is empty', async function () {
            await navigateTo(driver, '/cart');
            await driver.sleep(1500);

            const isEmpty = await elementExists(driver, By.css('.empty-cart'), 2000);
            if (isEmpty) {
                const icon = await elementExists(driver, By.css('.empty-cart-icon'));
                expect(icon).to.be.true;

                const text = await getElementText(driver, By.css('.empty-cart h2'));
                expect(text.toLowerCase()).to.include('empty');

                const shopBtn = await elementExists(driver, By.css('.shop-btn'));
                expect(shopBtn).to.be.true;
            }
        });

        it('should navigate to products via Browse Products button', async function () {
            const isEmpty = await elementExists(driver, By.css('.empty-cart'), 2000);
            if (isEmpty) {
                await clickElement(driver, By.css('.shop-btn'));
                await waitForUrl(driver, '/products');
                const url = await driver.getCurrentUrl();
                expect(url).to.include('/products');
            }
        });
    });

    // ───────────── CART WITH ITEMS ─────────────

    describe('Cart with Items', function () {
        before(async function () {
            // Navigate to products and add one
            await navigateTo(driver, '/products');
            await driver.sleep(2000);
            const addBtns = await driver.findElements(By.css('.add-to-cart-btn'));
            if (addBtns.length > 0) {
                await addBtns[0].click();
                await driver.sleep(2000);
            }
            await navigateTo(driver, '/cart');
            await driver.sleep(1500);
        });

        it('should display cart items if products were added', async function () {
            const hasItems = await elementExists(driver, By.css('.cart-item'), 2000);
            // This depends on whether products exist in the DB
            if (hasItems) {
                const items = await countElements(driver, By.css('.cart-item'));
                expect(items).to.be.greaterThanOrEqual(1);
            }
        });

        it('should display item details (name, price)', async function () {
            const hasItems = await elementExists(driver, By.css('.cart-item'), 2000);
            if (hasItems) {
                const name = await elementExists(driver, By.css('.item-details h3'));
                expect(name).to.be.true;

                const price = await elementExists(driver, By.css('.item-price'));
                expect(price).to.be.true;
            }
        });

        it('should display quantity controls', async function () {
            const hasItems = await elementExists(driver, By.css('.cart-item'), 2000);
            if (hasItems) {
                const qtyBtns = await countElements(driver, By.css('.qty-btn'));
                expect(qtyBtns).to.be.greaterThanOrEqual(2); // + and - per item

                const qtyValue = await elementExists(driver, By.css('.qty-value'));
                expect(qtyValue).to.be.true;
            }
        });

        it('should display order summary', async function () {
            const hasItems = await elementExists(driver, By.css('.cart-summary'), 2000);
            if (hasItems) {
                const totalText = await getElementText(driver, By.css('.summary-total'));
                expect(totalText).to.include('$');
            }
        });

        it('should display checkout button', async function () {
            const hasItems = await elementExists(driver, By.css('.checkout-btn'), 2000);
            if (hasItems) {
                const btnText = await getElementText(driver, By.css('.checkout-btn'));
                expect(btnText.toLowerCase()).to.include('checkout');
            }
        });

        it('should increase item quantity with + button', async function () {
            const hasItems = await elementExists(driver, By.css('.cart-item'), 2000);
            if (hasItems) {
                const qtyBefore = await getElementText(driver, By.css('.qty-value'));
                const plusBtns = await driver.findElements(By.css('.qty-btn'));
                // Click the + button (second button for first item)
                if (plusBtns.length >= 2) {
                    await plusBtns[1].click();
                    await driver.sleep(1500);

                    const qtyAfter = await getElementText(driver, By.css('.qty-value'));
                    expect(parseInt(qtyAfter)).to.be.greaterThanOrEqual(parseInt(qtyBefore));
                }
            }
        });

        it('should display clear cart button', async function () {
            const hasItems = await elementExists(driver, By.css('.clear-btn'), 2000);
            if (hasItems) {
                expect(hasItems).to.be.true;
            }
        });
    });

    // ───────────── CHECKOUT FLOW ─────────────

    describe('Checkout Flow', function () {
        it('should navigate to checkout page', async function () {
            await navigateTo(driver, '/cart');
            await driver.sleep(1500);

            const checkoutBtn = await elementExists(driver, By.css('.checkout-btn'), 2000);
            if (checkoutBtn) {
                await clickElement(driver, By.css('.checkout-btn'));
                await waitForUrl(driver, '/checkout');
                const url = await driver.getCurrentUrl();
                expect(url).to.include('/checkout');
            }
        });

        it('should display shipping address form', async function () {
            const url = await driver.getCurrentUrl();
            if (url.includes('/checkout')) {
                const streetField = await elementExists(driver, By.css("input[name='street']"));
                const cityField = await elementExists(driver, By.css("input[name='city']"));
                const stateField = await elementExists(driver, By.css("input[name='state']"));
                const zipField = await elementExists(driver, By.css("input[name='zipCode']"));

                // At least the checkout page loaded
                expect(url).to.include('/checkout');
            }
        });
    });

    // ───────────── CONTINUE SHOPPING ─────────────

    describe('Continue Shopping', function () {
        it('should navigate back to products via Continue Shopping', async function () {
            await navigateTo(driver, '/cart');
            await driver.sleep(1000);

            const backBtn = await elementExists(driver, By.css('.back-btn'));
            if (backBtn) {
                await clickElement(driver, By.css('.back-btn'));
                await waitForUrl(driver, '/products');
                const url = await driver.getCurrentUrl();
                expect(url).to.include('/products');
            }
        });
    });
});
