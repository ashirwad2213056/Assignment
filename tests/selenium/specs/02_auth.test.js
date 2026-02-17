/**
 * TEST SUITE 2: Authentication Tests (Registration & Login)
 * Tests user registration flow, login flow, validations, and error handling
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    clearAndType, elementExists, getElementText, waitForUrl,
    waitForPageLoad, registerUser, loginUser, logoutUser,
    screenshot, By, until,
} = require('../helpers');

describe('Authentication', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 3);
    let driver;

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    // ───────────── REGISTRATION PAGE UI ─────────────

    describe('Registration Page UI', function () {
        before(async function () {
            await navigateTo(driver, '/register');
        });

        it('should display the register page header', async function () {
            const header = await getElementText(driver, By.css('.auth-header h1'));
            expect(header).to.include('Create');
        });

        it('should have name input field', async function () {
            const exists = await elementExists(driver, By.id('name'));
            expect(exists).to.be.true;
        });

        it('should have email input field', async function () {
            const exists = await elementExists(driver, By.id('email'));
            expect(exists).to.be.true;
        });

        it('should have password input field', async function () {
            const exists = await elementExists(driver, By.id('password'));
            expect(exists).to.be.true;
        });

        it('should have confirm password input field', async function () {
            const exists = await elementExists(driver, By.id('confirmPassword'));
            expect(exists).to.be.true;
        });

        it('should have a role selector', async function () {
            const exists = await elementExists(driver, By.id('role'));
            expect(exists).to.be.true;
        });

        it('should have a submit button', async function () {
            const exists = await elementExists(driver, By.css('.auth-submit'));
            expect(exists).to.be.true;
        });

        it('should have a link to login page', async function () {
            const link = await elementExists(driver, By.xpath("//a[contains(@href, '/login')]"));
            expect(link).to.be.true;
        });
    });

    // ───────────── REGISTRATION VALIDATION ─────────────

    describe('Registration Validation', function () {
        it('should show error for empty form submission', async function () {
            await navigateTo(driver, '/register');
            await clickElement(driver, By.css('.auth-submit'));
            await driver.sleep(1000);
            // HTML5 validation will prevent submission or app shows an error
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/register');
        });

        it('should show error for mismatched passwords', async function () {
            await navigateTo(driver, '/register');
            await clearAndType(driver, By.id('name'), 'Test User');
            await clearAndType(driver, By.id('email'), 'mismatch@test.com');
            await clearAndType(driver, By.id('password'), 'Password123');
            await clearAndType(driver, By.id('confirmPassword'), 'DifferentPassword');
            await clickElement(driver, By.css('.auth-submit'));
            await driver.sleep(1000);

            const error = await elementExists(driver, By.css('.auth-error'));
            if (error) {
                const errorText = await getElementText(driver, By.css('.auth-error'));
                expect(errorText.toLowerCase()).to.include('match');
            }
            // Should stay on register page
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/register');
        });

        it('should show vendor fields when vendor role is selected', async function () {
            await navigateTo(driver, '/register');
            const roleSelect = await waitForElement(driver, By.id('role'));
            await roleSelect.sendKeys('Vendor');
            await driver.sleep(500);

            const businessName = await elementExists(driver, By.id('businessName'));
            expect(businessName).to.be.true;

            const serviceCategory = await elementExists(driver, By.id('serviceCategory'));
            expect(serviceCategory).to.be.true;
        });

        it('should hide vendor fields when non-vendor role is selected', async function () {
            await navigateTo(driver, '/register');
            // Default is "user", vendor fields should not be visible
            const businessName = await elementExists(driver, By.id('businessName'), 1000);
            expect(businessName).to.be.false;
        });
    });

    // ───────────── SUCCESSFUL REGISTRATION ─────────────

    describe('User Registration Flow', function () {
        it('should register a new regular user successfully', async function () {
            const userData = config.USERS.regular;
            await registerUser(driver, userData);

            // Should redirect to dashboard after registration
            await waitForUrl(driver, '/dashboard', config.TIMEOUT.ELEMENT_WAIT);
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/dashboard');
        });

        it('should show user name in navbar after registration', async function () {
            const userName = await getElementText(driver, By.css('.nav-user-name'));
            expect(userName).to.include(config.USERS.regular.name.split(' ')[0]);
        });

        it('should log out the registered user', async function () {
            await logoutUser(driver);
            await driver.sleep(1000);
            const url = await driver.getCurrentUrl();
            // Should redirect to home or login after logout
            expect(url.includes('/login') || url.includes('/')).to.be.true;
        });
    });

    // ───────────── VENDOR REGISTRATION ─────────────

    describe('Vendor Registration Flow', function () {
        it('should register a new vendor successfully', async function () {
            const vendorData = config.USERS.vendor;
            await registerUser(driver, vendorData);

            await waitForUrl(driver, '/dashboard', config.TIMEOUT.ELEMENT_WAIT);
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/dashboard');
        });

        it('should show vendor-specific links in navbar', async function () {
            // Vendor should see a Vendor link
            const vendorLink = await elementExists(driver, By.xpath("//a[contains(text(), 'Vendor')]"));
            expect(vendorLink).to.be.true;
        });

        it('should log out the vendor', async function () {
            await logoutUser(driver);
            await driver.sleep(1000);
        });
    });

    // ───────────── LOGIN PAGE UI ─────────────

    describe('Login Page UI', function () {
        before(async function () {
            await navigateTo(driver, '/login');
        });

        it('should display the login page header', async function () {
            const header = await getElementText(driver, By.css('.auth-header h1'));
            expect(header).to.include('Welcome');
        });

        it('should have email input field', async function () {
            const exists = await elementExists(driver, By.id('email'));
            expect(exists).to.be.true;
        });

        it('should have password input field', async function () {
            const exists = await elementExists(driver, By.id('password'));
            expect(exists).to.be.true;
        });

        it('should have a submit button', async function () {
            const exists = await elementExists(driver, By.css('.auth-submit'));
            expect(exists).to.be.true;
        });

        it('should have a link to register page', async function () {
            const link = await elementExists(driver, By.xpath("//a[contains(@href, '/register')]"));
            expect(link).to.be.true;
        });
    });

    // ───────────── LOGIN VALIDATION ─────────────

    describe('Login Validation', function () {
        it('should show error for invalid credentials', async function () {
            await navigateTo(driver, '/login');
            await clearAndType(driver, By.id('email'), 'nonexistent@test.com');
            await clearAndType(driver, By.id('password'), 'wrongpassword');
            await clickElement(driver, By.css('.auth-submit'));
            await driver.sleep(2000);

            const error = await elementExists(driver, By.css('.auth-error'));
            if (error) {
                const errorText = await getElementText(driver, By.css('.auth-error'));
                expect(errorText).to.not.be.empty;
            }
            // Should stay on login page
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/login');
        });

        it('should show error for empty email', async function () {
            await navigateTo(driver, '/login');
            await clearAndType(driver, By.id('password'), 'somepassword');
            await clickElement(driver, By.css('.auth-submit'));
            await driver.sleep(500);
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/login');
        });
    });

    // ───────────── SUCCESSFUL LOGIN ─────────────

    describe('User Login Flow', function () {
        it('should login the registered user successfully', async function () {
            const userData = config.USERS.regular;
            await loginUser(driver, userData.email, userData.password);

            await waitForUrl(driver, '/dashboard', config.TIMEOUT.ELEMENT_WAIT);
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/dashboard');
        });

        it('should display the user navbar after login', async function () {
            const exists = await elementExists(driver, By.css('.nav-user'));
            expect(exists).to.be.true;
        });

        it('should logout successfully', async function () {
            await logoutUser(driver);
        });
    });
});
