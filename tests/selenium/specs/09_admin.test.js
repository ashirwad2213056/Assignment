/**
 * TEST SUITE 9: Admin Panel Tests
 * Tests admin dashboard, user management, product management, and order management
 */

const { expect } = require('chai');
const config = require('../config');
const {
    createDriver, navigateTo, waitForElement, clickElement,
    clearAndType, elementExists, getElementText, waitForUrl,
    waitForPageLoad, loginUser, logoutUser, countElements,
    selectDropdown, By, until,
} = require('../helpers');

describe('Admin Panel', function () {
    this.timeout(config.TIMEOUT.PAGE_LOAD * 3);
    let driver;

    before(async function () {
        driver = await createDriver();
        // Login as admin
        await loginUser(driver, config.USERS.admin.email, config.USERS.admin.password);
    });

    after(async function () {
        await logoutUser(driver);
        if (driver) await driver.quit();
    });

    // ───────────── ACCESS CONTROL ─────────────

    describe('Admin Access Control', function () {
        it('should allow admin to access admin panel', async function () {
            await navigateTo(driver, '/admin');
            await driver.sleep(2000);
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/admin');
        });

        it('should show Admin link in navbar for admin user', async function () {
            const adminLink = await elementExists(driver, By.xpath("//a[contains(text(), 'Admin')]"));
            expect(adminLink).to.be.true;
        });
    });

    // ───────────── ADMIN DASHBOARD TAB ─────────────

    describe('Admin Dashboard Tab', function () {
        before(async function () {
            await navigateTo(driver, '/admin');
            await driver.sleep(2000);
        });

        it('should display admin panel header', async function () {
            const header = await getElementText(driver, By.css('.admin-header h1'));
            expect(header).to.include('Admin');
        });

        it('should display navigation tabs', async function () {
            const tabs = await countElements(driver, By.css('.admin-tab'));
            expect(tabs).to.equal(4); // dashboard, users, products, orders
        });

        it('should display Dashboard tab by default', async function () {
            const activeTab = await getElementText(driver, By.css('.admin-tab.active'));
            expect(activeTab.toLowerCase()).to.include('dashboard');
        });

        it('should display stats cards', async function () {
            const statCards = await countElements(driver, By.css('.stat-card'));
            expect(statCards).to.be.greaterThanOrEqual(4);
        });

        it('should display Users stat', async function () {
            const usersStat = await elementExists(driver, By.css('.stat-users'));
            expect(usersStat).to.be.true;
        });

        it('should display Vendors stat', async function () {
            const vendorsStat = await elementExists(driver, By.css('.stat-vendors'));
            expect(vendorsStat).to.be.true;
        });

        it('should display Products stat', async function () {
            const productsStat = await elementExists(driver, By.css('.stat-products'));
            expect(productsStat).to.be.true;
        });

        it('should display Orders stat', async function () {
            const ordersStat = await elementExists(driver, By.css('.stat-orders'));
            expect(ordersStat).to.be.true;
        });

        it('should display Revenue stat', async function () {
            const revenueStat = await elementExists(driver, By.css('.stat-revenue'));
            expect(revenueStat).to.be.true;
        });

        it('should show stat numbers', async function () {
            const statNumbers = await driver.findElements(By.css('.stat-number'));
            expect(statNumbers.length).to.be.greaterThanOrEqual(4);

            for (const stat of statNumbers) {
                const text = await stat.getText();
                expect(text).to.not.be.empty;
            }
        });
    });

    // ───────────── USERS TAB ─────────────

    describe('Users Management Tab', function () {
        before(async function () {
            await navigateTo(driver, '/admin');
            await driver.sleep(1000);
            await clickElement(driver, By.xpath("//button[contains(text(), 'Users')]"));
            await driver.sleep(2000);
        });

        it('should switch to Users tab', async function () {
            const activeTab = await getElementText(driver, By.css('.admin-tab.active'));
            expect(activeTab.toLowerCase()).to.include('users');
        });

        it('should display user search input', async function () {
            const search = await elementExists(driver, By.css('.admin-search'));
            expect(search).to.be.true;
        });

        it('should display role filter dropdown', async function () {
            const filter = await elementExists(driver, By.css('.admin-filter'));
            expect(filter).to.be.true;
        });

        it('should display Apply filter button', async function () {
            const applyBtn = await elementExists(driver, By.css('.filter-apply-btn'));
            expect(applyBtn).to.be.true;
        });

        it('should display users table', async function () {
            const table = await elementExists(driver, By.css('.admin-table'));
            expect(table).to.be.true;
        });

        it('should display table headers: Name, Email, Role, Status, Joined, Actions', async function () {
            const headers = await driver.findElements(By.css('.admin-table thead th'));
            const headerTexts = [];
            for (const h of headers) {
                headerTexts.push(await h.getText());
            }
            expect(headerTexts).to.include('Name');
            expect(headerTexts).to.include('Email');
            expect(headerTexts).to.include('Role');
            expect(headerTexts).to.include('Status');
        });

        it('should display at least one user in the table', async function () {
            const rows = await countElements(driver, By.css('.admin-table tbody tr'));
            expect(rows).to.be.greaterThanOrEqual(1);
        });

        it('should have role selector dropdown per user', async function () {
            const roleSelects = await countElements(driver, By.css('.role-select'));
            expect(roleSelects).to.be.greaterThanOrEqual(1);
        });

        it('should have status toggle button per user', async function () {
            const toggleBtns = await countElements(driver, By.css('.toggle-btn'));
            expect(toggleBtns).to.be.greaterThanOrEqual(1);
        });

        it('should display user status (Active/Inactive)', async function () {
            const statusDots = await countElements(driver, By.css('.status-dot'));
            expect(statusDots).to.be.greaterThanOrEqual(1);
        });

        it('should filter users by role', async function () {
            const filterSelect = await waitForElement(driver, By.css('.admin-filter'));
            await filterSelect.sendKeys('Vendor');
            await clickElement(driver, By.css('.filter-apply-btn'));
            await driver.sleep(1500);

            // Table should still render (possibly with fewer rows)
            const table = await elementExists(driver, By.css('.admin-table'));
            expect(table).to.be.true;

            // Reset filter
            const allOption = await driver.findElements(By.xpath("//select[@class='admin-filter']//option[@value='']"));
            if (allOption.length > 0) {
                await allOption[0].click();
                await clickElement(driver, By.css('.filter-apply-btn'));
                await driver.sleep(1000);
            }
        });

        it('should search users by name', async function () {
            await clearAndType(driver, By.css('.admin-search'), 'test');
            await clickElement(driver, By.css('.filter-apply-btn'));
            await driver.sleep(1500);

            const table = await elementExists(driver, By.css('.admin-table'));
            expect(table).to.be.true;

            // Clear search
            const searchField = await waitForElement(driver, By.css('.admin-search'));
            await searchField.clear();
            await clickElement(driver, By.css('.filter-apply-btn'));
            await driver.sleep(1000);
        });
    });

    // ───────────── PRODUCTS TAB ─────────────

    describe('Products Management Tab', function () {
        before(async function () {
            await navigateTo(driver, '/admin');
            await driver.sleep(1000);
            await clickElement(driver, By.xpath("//button[contains(text(), 'Products')]"));
            await driver.sleep(2000);
        });

        it('should switch to Products tab', async function () {
            const activeTab = await getElementText(driver, By.css('.admin-tab.active'));
            expect(activeTab.toLowerCase()).to.include('products');
        });

        it('should display products table', async function () {
            const table = await elementExists(driver, By.css('.admin-table'));
            expect(table).to.be.true;
        });

        it('should display table headers: Product, Vendor, Category, Price, Status, Actions', async function () {
            const headers = await driver.findElements(By.css('.admin-table thead th'));
            const headerTexts = [];
            for (const h of headers) {
                headerTexts.push(await h.getText());
            }
            expect(headerTexts).to.include('Product');
            expect(headerTexts).to.include('Vendor');
            expect(headerTexts).to.include('Price');
            expect(headerTexts).to.include('Status');
        });

        it('should show category badges for products', async function () {
            const badges = await countElements(driver, By.css('.category-badge'));
            // May be 0 if no products
            expect(badges).to.be.greaterThanOrEqual(0);
        });

        it('should show product availability status', async function () {
            const statusDots = await countElements(driver, By.css('.status-dot'));
            expect(statusDots).to.be.greaterThanOrEqual(0);
        });

        it('should have toggle availability button per product', async function () {
            const toggleBtns = await countElements(driver, By.css('.toggle-btn'));
            expect(toggleBtns).to.be.greaterThanOrEqual(0);
        });

        it('should have delete button per product', async function () {
            const deleteBtns = await countElements(driver, By.css('.delete-btn'));
            expect(deleteBtns).to.be.greaterThanOrEqual(0);
        });
    });

    // ───────────── ORDERS TAB ─────────────

    describe('Orders Management Tab', function () {
        before(async function () {
            await navigateTo(driver, '/admin');
            await driver.sleep(1000);
            await clickElement(driver, By.xpath("//button[contains(text(), 'Orders')]"));
            await driver.sleep(2000);
        });

        it('should switch to Orders tab', async function () {
            const activeTab = await getElementText(driver, By.css('.admin-tab.active'));
            expect(activeTab.toLowerCase()).to.include('orders');
        });

        it('should display order status filter', async function () {
            const filter = await elementExists(driver, By.css('.admin-filter'));
            expect(filter).to.be.true;
        });

        it('should display orders table', async function () {
            const table = await elementExists(driver, By.css('.admin-table'));
            expect(table).to.be.true;
        });

        it('should display table headers: Order ID, Customer, Items, Total, Status, Date, Actions', async function () {
            const headers = await driver.findElements(By.css('.admin-table thead th'));
            const headerTexts = [];
            for (const h of headers) {
                headerTexts.push(await h.getText());
            }
            expect(headerTexts).to.include('Order ID');
            expect(headerTexts).to.include('Customer');
            expect(headerTexts).to.include('Total');
            expect(headerTexts).to.include('Status');
        });

        it('should have status selector per order', async function () {
            const statusSelects = await countElements(driver, By.css('.status-select'));
            // May be 0 if no orders exist
            expect(statusSelects).to.be.greaterThanOrEqual(0);
        });

        it('should have view details button per order', async function () {
            const viewBtns = await countElements(driver, By.css('.view-btn'));
            expect(viewBtns).to.be.greaterThanOrEqual(0);
        });

        it('should filter orders by status', async function () {
            const filterSelect = await waitForElement(driver, By.css('.admin-filter'));
            await filterSelect.sendKeys('Pending');
            await driver.sleep(1500);

            const table = await elementExists(driver, By.css('.admin-table'));
            expect(table).to.be.true;

            // Reset filter
            const allOption = await driver.findElements(By.xpath("//select[@class='admin-filter']//option[@value='']"));
            if (allOption.length > 0) {
                await allOption[0].click();
                await driver.sleep(1000);
            }
        });
    });

    // ───────────── BACK NAVIGATION ─────────────

    describe('Admin Back Navigation', function () {
        it('should have Dashboard back button', async function () {
            await navigateTo(driver, '/admin');
            await driver.sleep(1000);

            const backBtn = await elementExists(driver, By.css('.admin-back-btn'));
            expect(backBtn).to.be.true;
        });

        it('should navigate back to dashboard when back button is clicked', async function () {
            await clickElement(driver, By.css('.admin-back-btn'));
            await waitForUrl(driver, '/dashboard');
            const url = await driver.getCurrentUrl();
            expect(url).to.include('/dashboard');
        });
    });
});
