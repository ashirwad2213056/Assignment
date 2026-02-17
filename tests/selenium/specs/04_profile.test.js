/**
 * TEST SUITE 4: Profile Page Tests
 * Tests profile view, profile update, password change, and danger zone
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    clearAndType, elementExists, getElementText, waitForUrl,
    waitForPageLoad, loginUser, logoutUser, By, until,
} = require('../helpers');

describe('Profile Page', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 3);
    let driver;

    before(async function () {
        driver = await createDriver();
        await loginUser(driver, config.USERS.regular.email, config.USERS.regular.password);
        await waitForUrl(driver, '/dashboard', config.TIMEOUT.ELEMENT_WAIT);
    });

    after(async function () {
        await logoutUser(driver);
        if (driver) await driver.quit();
    });

    // ───────────── PROFILE PAGE UI ─────────────

    describe('Profile Page UI', function () {
        before(async function () {
            await navigateTo(driver, '/profile');
        });

        it('should load the profile page', async function () {
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/profile');
        });

        it('should display the user avatar', async function () {
            const avatar = await elementExists(driver, By.css('.profile-avatar-large'));
            expect(avatar).to.be.true;
        });

        it('should display the user name in header', async function () {
            const name = await getElementText(driver, By.css('.profile-header h1'));
            expect(name).to.include(config.USERS.regular.name);
        });

        it('should display the role tag', async function () {
            const role = await getElementText(driver, By.css('.role-tag'));
            expect(role.toLowerCase()).to.include('user');
        });

        it('should display profile tabs', async function () {
            const tabs = await driver.findElements(By.css('.profile-tab'));
            expect(tabs.length).to.equal(3);
        });

        it('should display Profile tab as active by default', async function () {
            const activeTab = await getElementText(driver, By.css('.profile-tab.active'));
            expect(activeTab).to.include('Profile');
        });
    });

    // ───────────── TAB SWITCHING ─────────────

    describe('Tab Navigation', function () {
        it('should switch to Password tab', async function () {
            await navigateTo(driver, '/profile');
            await clickElement(driver, By.xpath("//button[contains(text(), 'Password')]"));
            await driver.sleep(500);

            const activeTab = await getElementText(driver, By.css('.profile-tab.active'));
            expect(activeTab).to.include('Password');
        });

        it('should display password form fields', async function () {
            const currentPwd = await elementExists(driver, By.css("input[name='currentPassword']"));
            expect(currentPwd).to.be.true;

            const newPwd = await elementExists(driver, By.css("input[name='newPassword']"));
            expect(newPwd).to.be.true;

            const confirmPwd = await elementExists(driver, By.css("input[name='confirmPassword']"));
            expect(confirmPwd).to.be.true;
        });

        it('should display password requirements hint', async function () {
            const hint = await elementExists(driver, By.css('.password-hint'));
            expect(hint).to.be.true;
        });

        it('should switch to Danger Zone tab', async function () {
            await clickElement(driver, By.xpath("//button[contains(text(), 'Danger')]"));
            await driver.sleep(500);

            const dangerZone = await elementExists(driver, By.css('.danger-zone'));
            expect(dangerZone).to.be.true;
        });

        it('should display delete account button in Danger Zone', async function () {
            const deleteBtn = await elementExists(driver, By.css('.btn-danger'));
            expect(deleteBtn).to.be.true;
        });

        it('should switch back to Profile tab', async function () {
            await clickElement(driver, By.xpath("//button[contains(text(), 'Profile')]"));
            await driver.sleep(500);

            const activeTab = await getElementText(driver, By.css('.profile-tab.active'));
            expect(activeTab).to.include('Profile');
        });
    });

    // ───────────── PROFILE FORM ─────────────

    describe('Profile Edit Form', function () {
        before(async function () {
            await navigateTo(driver, '/profile');
        });

        it('should have name field pre-populated', async function () {
            const nameField = await waitForElement(driver, By.css("input[name='name']"));
            const value = await nameField.getAttribute('value');
            expect(value).to.not.be.empty;
        });

        it('should have email field pre-populated', async function () {
            const emailField = await waitForElement(driver, By.css("input[name='email']"));
            const value = await emailField.getAttribute('value');
            expect(value).to.include('@');
        });

        it('should have a Save Changes button', async function () {
            const saveBtn = await elementExists(driver, By.css('.btn-primary'));
            expect(saveBtn).to.be.true;
        });

        it('should have a Cancel button', async function () {
            const cancelBtn = await elementExists(driver, By.css('.btn-secondary'));
            expect(cancelBtn).to.be.true;
        });

        it('should display the role display field', async function () {
            const roleDisplay = await elementExists(driver, By.css('.role-display'));
            expect(roleDisplay).to.be.true;
        });

        it('should update profile successfully when name is modified', async function () {
            const updatedName = config.USERS.regular.name + ' Updated';
            await clearAndType(driver, By.css("input[name='name']"), updatedName);
            await clickElement(driver, By.css('.btn-primary'));
            await driver.sleep(2000);

            const successMsg = await elementExists(driver, By.css('.profile-alert.success'));
            expect(successMsg).to.be.true;

            // Revert name
            await clearAndType(driver, By.css("input[name='name']"), config.USERS.regular.name);
            await clickElement(driver, By.css('.btn-primary'));
            await driver.sleep(2000);
        });
    });

    // ───────────── PASSWORD CHANGE ─────────────

    describe('Password Change', function () {
        before(async function () {
            await navigateTo(driver, '/profile');
            await clickElement(driver, By.xpath("//button[contains(text(), 'Password')]"));
            await driver.sleep(500);
        });

        it('should show error for mismatched new passwords', async function () {
            await clearAndType(driver, By.css("input[name='currentPassword']"), config.USERS.regular.password);
            await clearAndType(driver, By.css("input[name='newPassword']"), 'NewPassword123');
            await clearAndType(driver, By.css("input[name='confirmPassword']"), 'DifferentPassword');
            await clickElement(driver, By.css('.btn-primary'));
            await driver.sleep(1000);

            const error = await elementExists(driver, By.css('.profile-alert.error'));
            expect(error).to.be.true;
        });

        it('should show error for short password', async function () {
            await navigateTo(driver, '/profile');
            await clickElement(driver, By.xpath("//button[contains(text(), 'Password')]"));
            await driver.sleep(500);

            await clearAndType(driver, By.css("input[name='currentPassword']"), config.USERS.regular.password);
            await clearAndType(driver, By.css("input[name='newPassword']"), '123');
            await clearAndType(driver, By.css("input[name='confirmPassword']"), '123');
            await clickElement(driver, By.css('.btn-primary'));
            await driver.sleep(1000);

            const error = await elementExists(driver, By.css('.profile-alert.error'));
            expect(error).to.be.true;
        });
    });
});
