/**
 * TEST SUITE 10: Navbar & Global UI Tests
 * Tests the shared navbar across different auth states and roles
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    elementExists, getElementText, waitForUrl, countElements,
    loginUser, logoutUser, By, until,
} = require('../helpers');

describe('Navbar & Global UI', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 3);
    let driver;

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    // ───────────── UNAUTHENTICATED NAVBAR ─────────────

    describe('Unauthenticated Navbar', function () {
        before(async function () {
            await navigateTo(driver, '/');
        });

        it('should display the navbar', async function () {
            const navbar = await elementExists(driver, By.css('.navbar'));
            expect(navbar).to.be.true;
        });

        it('should display the brand name', async function () {
            const brand = await getElementText(driver, By.css('.brand-text'));
            expect(brand).to.equal('EventHub');
        });

        it('should display the brand emoji', async function () {
            const emoji = await getElementText(driver, By.css('.brand-emoji'));
            expect(emoji).to.include('🎪');
        });

        it('should show Login link', async function () {
            const login = await elementExists(driver, By.xpath("//a[contains(text(), 'Login')]"));
            expect(login).to.be.true;
        });

        it('should show Get Started CTA button', async function () {
            const cta = await elementExists(driver, By.css('.nav-cta'));
            const ctaText = await getElementText(driver, By.css('.nav-cta'));
            expect(ctaText).to.include('Get Started');
        });

        it('should NOT show user avatar', async function () {
            const avatar = await elementExists(driver, By.css('.nav-avatar'), 1000);
            expect(avatar).to.be.false;
        });

        it('should NOT show logout button', async function () {
            const logout = await elementExists(driver, By.css('.nav-logout'), 1000);
            expect(logout).to.be.false;
        });

        it('should NOT show Dashboard link', async function () {
            const dashboard = await elementExists(driver, By.xpath("//a[contains(text(), 'Dashboard')]"), 1000);
            expect(dashboard).to.be.false;
        });
    });

    // ───────────── AUTHENTICATED USER NAVBAR ─────────────

    describe('Authenticated User Navbar', function () {
        before(async function () {
            await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);
            await driver.sleep(1000);
        });

        after(async function () {
            await logoutUser(driver);
        });

        it('should show Dashboard link', async function () {
            const dashboard = await elementExists(driver, By.xpath("//a[contains(text(), 'Dashboard')]"));
            expect(dashboard).to.be.true;
        });

        it('should show Products link', async function () {
            const products = await elementExists(driver, By.xpath("//a[contains(text(), 'Products')]"));
            expect(products).to.be.true;
        });

        it('should show Orders link', async function () {
            const orders = await elementExists(driver, By.xpath("//a[contains(text(), 'Orders')]"));
            expect(orders).to.be.true;
        });

        it('should show Cart link', async function () {
            const cart = await elementExists(driver, By.xpath("//a[contains(text(), 'Cart')]"));
            expect(cart).to.be.true;
        });

        it('should show user avatar/profile area', async function () {
            const navUser = await elementExists(driver, By.css('.nav-user'));
            expect(navUser).to.be.true;
        });

        it('should show user name', async function () {
            const name = await getElementText(driver, By.css('.nav-user-name'));
            expect(name).to.not.be.empty;
        });

        it('should show logout button', async function () {
            const logout = await elementExists(driver, By.css('.nav-logout'));
            expect(logout).to.be.true;
        });

        it('should NOT show Login link when authenticated', async function () {
            const login = await elementExists(driver, By.xpath("//a[contains(@class, 'nav-link') and text()='Login']"), 1000);
            expect(login).to.be.false;
        });

        it('should NOT show Get Started CTA when authenticated', async function () {
            const cta = await elementExists(driver, By.css('.nav-cta'), 1000);
            expect(cta).to.be.false;
        });

        it('should NOT show Admin link for regular user', async function () {
            const admin = await elementExists(driver, By.xpath("//a[contains(text(), 'Admin')]"), 1000);
            expect(admin).to.be.false;
        });

        it('should NOT show Vendor link for regular user', async function () {
            const vendor = await elementExists(driver, By.xpath("//a[contains(text(), 'Vendor')]"), 1000);
            expect(vendor).to.be.false;
        });
    });

    // ───────────── VENDOR NAVBAR ─────────────

    describe('Vendor Navbar', function () {
        before(async function () {
            await loginUser(driver, config.USERS.vendor.email, config.USERS.vendor.password);
            await driver.sleep(1000);
        });

        after(async function () {
            await logoutUser(driver);
        });

        it('should show Vendor link for vendor user', async function () {
            const vendor = await elementExists(driver, By.xpath("//a[contains(text(), 'Vendor')]"));
            expect(vendor).to.be.true;
        });

        it('should navigate to vendor dashboard from Vendor link', async function () {
            await clickElement(driver, By.xpath("//a[contains(text(), 'Vendor')]"));
            await waitForUrl(driver, '/vendor');
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/vendor');
        });
    });

    // ───────────── ACTIVE LINK HIGHLIGHTING ─────────────

    describe('Active Link Highlighting', function () {
        before(async function () {
            await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);
        });

        after(async function () {
            await logoutUser(driver);
        });

        it('should highlight Dashboard link when on dashboard', async function () {
            await navigateTo(driver, '/dashboard');
            await driver.sleep(500);

            const dashboardLink = await driver.findElement(By.xpath("//a[contains(text(), 'Dashboard')]"));
            const classes = await dashboardLink.getAttribute('class');
            expect(classes).to.include('active');
        });

        it('should highlight Products link when on products page', async function () {
            await navigateTo(driver, '/products');
            await driver.sleep(500);

            const productsLink = await driver.findElement(By.xpath("//a[contains(text(), 'Products')]"));
            const classes = await productsLink.getAttribute('class');
            expect(classes).to.include('active');
        });

        it('should highlight Orders link when on orders page', async function () {
            await navigateTo(driver, '/orders');
            await driver.sleep(500);

            const ordersLink = await driver.findElement(By.xpath("//a[contains(text(), 'Orders')]"));
            const classes = await ordersLink.getAttribute('class');
            expect(classes).to.include('active');
        });
    });

    // ───────────── LOGOUT FLOW ─────────────

    describe('Logout Flow', function () {
        before(async function () {
            await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);
        });

        it('should logout when logout button is clicked', async function () {
            await clickElement(driver, By.css('.nav-logout'));
            await driver.sleep(2000);

            // Should redirect away from dashboard
            const url = await driver.getCurrentUrl();
            expect(url.includes('/login') || url === config.BASE_URL + '/').to.be.true;
        });

        it('should show unauthenticated navbar after logout', async function () {
            const loginLink = await elementExists(driver, By.xpath("//a[contains(text(), 'Login')]"));
            expect(loginLink).to.be.true;
        });

        it('should not show user avatar after logout', async function () {
            const avatar = await elementExists(driver, By.css('.nav-avatar'), 1000);
            expect(avatar).to.be.false;
        });
    });

    // ───────────── NAVBAR PERSISTENCE ─────────────

    describe('Navbar Persistence', function () {
        it('should display navbar on every page (unauthenticated)', async function () {
            const pages = ['/', '/login', '/register', '/products'];
            for (const page of pages) {
                await navigateTo(driver, page);
                await driver.sleep(300);
                const navbar = await elementExists(driver, By.css('.navbar'));
                expect(navbar, `Navbar missing on ${page}`).to.be.true;
            }
        });

        it('should display navbar on protected pages (authenticated)', async function () {
            await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);

            const pages = ['/dashboard', '/products', '/cart', '/orders', '/profile'];
            for (const page of pages) {
                await navigateTo(driver, page);
                await driver.sleep(300);
                const navbar = await elementExists(driver, By.css('.navbar'));
                expect(navbar, `Navbar missing on ${page}`).to.be.true;
            }

            await logoutUser(driver);
        });
    });
});
