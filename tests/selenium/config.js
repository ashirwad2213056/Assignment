/**
 * Selenium Test Configuration
 * Central config for all test suites
 */

module.exports = {
    // Application URLs
    BASE_URL: process.env.TEST_BASE_URL || 'http://127.0.0.1:4173',
    API_URL: process.env.TEST_API_URL || 'http://127.0.0.1:5000/api',

    // Browser settings
    BROWSER: process.env.TEST_BROWSER || 'chrome',
    HEADLESS: process.env.TEST_HEADLESS === 'true' || false,
    WINDOW_WIDTH: 1366,
    WINDOW_HEIGHT: 768,

    // Timeouts (in milliseconds)
    TIMEOUT: {
        IMPLICIT: 10000,
        PAGE_LOAD: 30000,
        SCRIPT: 30000,
        ELEMENT_WAIT: 10000,
        SHORT_WAIT: 3000,
        ANIMATION: 1000,
        TOAST: 4000,
    },

    // Test User Credentials
    USERS: {
        regular: {
            name: 'Test User Selenium',
            email: `testuser_selenium_${Date.now()}@test.com`,
            password: 'Test@123456',
            role: 'user',
            phone: '+1234567890',
        },
        vendor: {
            name: 'Test Vendor Selenium',
            email: `testvendor_selenium_${Date.now()}@test.com`,
            password: 'Test@123456',
            role: 'vendor',
            phone: '+1987654321',
            businessName: 'Selenium Test Shop',
            businessDescription: 'A test vendor created by Selenium',
            serviceCategory: 'catering',
        },
        admin: {
            // Admin user should already exist in the database
            email: 'admin@test.com',
            password: 'Admin@123456',
        },
    },

    // Test Product Data
    TEST_PRODUCT: {
        name: `Selenium Test Product ${Date.now()}`,
        description: 'A product created by Selenium automated tests',
        price: 29.99,
        category: 'catering',
        stock: 100,
    },

    // Shipping Address for Checkout
    TEST_ADDRESS: {
        street: '123 Selenium Test Street',
        city: 'Testville',
        state: 'TestState',
        zipCode: '12345',
        country: 'TestCountry',
    },
};
