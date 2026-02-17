/**
 * TEST SUITE 1: Home Page & Navigation Tests
 * Tests the landing page UI, navigation links, and system status indicator
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    elementExists, getElementText, waitForUrl, waitForPageLoad,
    By, until,
} = require('../helpers');

describe('Home Page & Navigation', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 2);
    let driver;

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    // ───────────── HOME PAGE UI ─────────────

    describe('Home Page UI Elements', function () {
        before(async function () {
            await navigateTo(driver, '/');
        });

        it('should load the home page successfully', async function () {
            const url = await driver.getCurrentUrl();
            expect(url).to.include(config.BASE_URL);
        });

        it('should display the navbar with brand logo', async function () {
            const brand = await waitForElement(driver, By.css('.navbar-brand'));
            expect(brand).to.not.be.null;
            const brandText = await getElementText(driver, By.css('.brand-text'));
            expect(brandText).to.equal('EventHub');
        });

        it('should display the hero section', async function () {
            const heroTitle = await waitForElement(driver, By.css('.hero-title'));
            expect(heroTitle).to.not.be.null;
        });

        it('should display the hero badge', async function () {
            const badge = await getElementText(driver, By.css('.hero-badge'));
            expect(badge).to.include('all-in-one');
        });

        it('should display CTA buttons (Get Started & Sign In)', async function () {
            const primaryCta = await elementExists(driver, By.css('.btn-hero-primary'));
            expect(primaryCta).to.be.true;

            const secondaryCta = await elementExists(driver, By.css('.btn-hero-secondary'));
            expect(secondaryCta).to.be.true;
        });

        it('should display the system status indicator', async function () {
            const status = await elementExists(driver, By.css('.status-indicator'));
            expect(status).to.be.true;
        });

        it('should display all 6 feature cards', async function () {
            const cards = await driver.findElements(By.css('.feature-card'));
            expect(cards.length).to.equal(6);
        });

        it('should display feature card titles', async function () {
            const titles = await driver.findElements(By.css('.feature-card h3'));
            const titleTexts = [];
            for (const t of titles) {
                titleTexts.push(await t.getText());
            }
            expect(titleTexts).to.include('Event Management');
            expect(titleTexts).to.include('Vendor Dashboard');
            expect(titleTexts).to.include('Product Marketplace');
            expect(titleTexts).to.include('Cart & Checkout');
            expect(titleTexts).to.include('Order Tracking');
            expect(titleTexts).to.include('Admin Panel');
        });

        it('should display the CTA section', async function () {
            const ctaSection = await elementExists(driver, By.css('.cta-section'));
            expect(ctaSection).to.be.true;
        });

        it('should display the footer', async function () {
            const footer = await getElementText(driver, By.css('.home-footer'));
            expect(footer).to.include('EventHub');
        });
    });

    // ───────────── NAVIGATION LINKS ─────────────

    describe('Navigation Links (Unauthenticated)', function () {
        it('should show Products link in navbar', async function () {
            await navigateTo(driver, '/');
            const productsLink = await elementExists(driver, By.xpath("//a[contains(@class, 'nav-link') and contains(text(), 'Products')]"));
            expect(productsLink).to.be.true;
        });

        it('should show Login link in navbar', async function () {
            const loginLink = await elementExists(driver, By.xpath("//a[contains(@class, 'nav-link') and contains(text(), 'Login')]"));
            expect(loginLink).to.be.true;
        });

        it('should show Get Started CTA in navbar', async function () {
            const cta = await elementExists(driver, By.css('.nav-cta'));
            expect(cta).to.be.true;
        });

        it('should navigate to login page when Login is clicked', async function () {
            await clickElement(driver, By.xpath("//a[contains(@class, 'nav-link') and contains(text(), 'Login')]"));
            await waitForUrl(driver, '/login');
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/login');
        });

        it('should navigate to register page when Get Started is clicked', async function () {
            await navigateTo(driver, '/');
            await clickElement(driver, By.css('.nav-cta'));
            await waitForUrl(driver, '/register');
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/register');
        });

        it('should navigate to products page', async function () {
            await navigateTo(driver, '/');
            await clickElement(driver, By.xpath("//a[contains(@class, 'nav-link') and contains(text(), 'Products')]"));
            await waitForUrl(driver, '/products');
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/products');
        });
    });

    // ───────────── RESPONSIVE BEHAVIOR ─────────────

    describe('Responsive Design', function () {
        it('should render feature cards in a grid on desktop', async function () {
            await navigateTo(driver, '/');
            const grid = await waitForElement(driver, By.css('.features-grid'));
            expect(grid).to.not.be.null;
        });
    });
});
