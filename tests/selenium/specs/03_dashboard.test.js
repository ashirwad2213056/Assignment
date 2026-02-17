/**
 * TEST SUITE 3: Dashboard Tests
 * Tests dashboard UI, stats cards, quick actions, and role-based content
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    elementExists, getElementText, waitForUrl, waitForPageLoad,
    loginUser, logoutUser, By, until, countElements,
} = require('../helpers');

describe('Dashboard', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 3);
    let driver;

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    // ───────────── PROTECTED ROUTE ─────────────

    describe('Protected Route', function () {
        it('should redirect to login when accessing dashboard without auth', async function () {
            await navigateTo(driver, '/dashboard');
            await driver.sleep(2000);
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/login');
        });
    });

    // ───────────── REGULAR USER DASHBOARD ─────────────

    describe('Regular User Dashboard', function () {
        before(async function () {
            await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);
            await waitForUrl(driver, '/dashboard', config.TIMEOUT.ELEMENT_WAIT);
        });

        after(async function () {
            await logoutUser(driver);
        });

        it('should display the dashboard page', async function () {
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/dashboard');
        });

        it('should display the welcome section', async function () {
            const welcome = await elementExists(driver, By.css('.dash-welcome'));
            expect(welcome).to.be.true;
        });

        it('should display welcome message with user name', async function () {
            const welcomeText = await getElementText(driver, By.css('.dash-welcome h1'));
            expect(welcomeText.toLowerCase()).to.include('welcome');
        });

        it('should display stat cards', async function () {
            const statsSection = await elementExists(driver, By.css('.dash-stats'));
            expect(statsSection).to.be.true;

            const cards = await countElements(driver, By.css('.stat-card'));
            expect(cards).to.be.greaterThanOrEqual(2);
        });

        it('should display quick actions section', async function () {
            const panel = await elementExists(driver, By.xpath("//*[contains(@class, 'dash-panel')]"));
            expect(panel).to.be.true;
        });

        it('should have Browse Products quick action', async function () {
            const action = await elementExists(driver, By.xpath("//button[contains(text(), 'Browse Products')]"));
            expect(action).to.be.true;
        });

        it('should navigate to products when Browse Products is clicked', async function () {
            await clickElement(driver, By.xpath("//button[contains(text(), 'Browse Products')]"));
            await waitForUrl(driver, '/products');
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/products');
            await navigateTo(driver, '/dashboard');
        });

        it('should have My Orders quick action', async function () {
            const action = await elementExists(driver, By.xpath("//button[contains(text(), 'My Orders')]"));
            expect(action).to.be.true;
        });

        it('should have Edit Profile quick action', async function () {
            const action = await elementExists(driver, By.xpath("//button[contains(text(), 'Edit Profile')]"));
            expect(action).to.be.true;
        });

        it('should NOT show Vendor Panel for regular user', async function () {
            const vendorAction = await elementExists(driver, By.xpath("//button[contains(text(), 'Vendor Panel')]"), 1000);
            expect(vendorAction).to.be.false;
        });

        it('should NOT show Admin Panel for regular user', async function () {
            const adminAction = await elementExists(driver, By.xpath("//button[contains(text(), 'Admin Panel')]"), 1000);
            expect(adminAction).to.be.false;
        });
    });

    // ───────────── VENDOR DASHBOARD ─────────────

    describe('Vendor Dashboard', function () {
        before(async function () {
            await loginUser(driver, config.USERS.vendor.email, config.USERS.vendor.password);
            await waitForUrl(driver, '/dashboard', config.TIMEOUT.ELEMENT_WAIT);
        });

        after(async function () {
            await logoutUser(driver);
        });

        it('should display vendor-specific role badge', async function () {
            const badge = await getElementText(driver, By.css('.dash-role'));
            expect(badge.toLowerCase()).to.include('vendor');
        });

        it('should show Vendor Panel quick action', async function () {
            const vendorAction = await elementExists(driver, By.xpath("//button[contains(text(), 'Vendor Panel')]"));
            expect(vendorAction).to.be.true;
        });

        it('should navigate to vendor dashboard from quick action', async function () {
            await clickElement(driver, By.xpath("//button[contains(text(), 'Vendor Panel')]"));
            await waitForUrl(driver, '/vendor');
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/vendor');
            await navigateTo(driver, '/dashboard');
        });
    });
});
