# 🧪 Selenium Automated Tests

Comprehensive Selenium WebDriver test suite for the **Event Management Application**.

## ✅ Test Suites

| # | Suite | File | Coverage |
|---|-------|------|----------|
| 1 | **Home Page** | `01_home.test.js` | Landing page UI & navigation |
| 2 | **Authentication** | `02_auth.test.js` | Login, Register, Validation |
| 3 | **Dashboard** | `03_dashboard.test.js` | Protected routes, stats |
| 4 | **Profile** | `04_profile.test.js` | Profile edit, password change |
| 5 | **Products** | `05_products.test.js` | Listing, search, cart add |
| 6 | **Cart** | `06_cart_checkout.test.js` | Cart mgmt, checkout flow |
| 7 | **Orders** | `07_orders.test.js` | Order listing, details |
| 8 | **Vendor** | `08_vendor.test.js` | Product CRUD |
| 9 | **Admin** | `09_admin.test.js` | User/Product mgmt |
| 10 | **Navbar** | `10_navbar.test.js` | Global UI states |

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **Google Chrome** installed
- **MongoDB** running locally or via Atlas

### 2. Install Dependencies
```bash
cd tests/selenium
npm install
```

### 3. Start Backend Server
Enable MongoDB connection in backend first.
```bash
cd backend
npm run dev
# Server should run on http://localhost:5000
```

### 4. Start Frontend (Best Practice)
Use the production preview server to avoid dev server issues (like `NET::ERR_CONNECTION_REFUSED`):
```bash
# In project root
npm run build
npx vite preview --port 4173 --host 127.0.0.1
```

### 5. Run Tests
```bash
cd tests/selenium
npm test
```

To run individual suites:
```bash
npm run test:home
npm run test:auth
# ... see package.json for more
```

## ⚙️ Configuration
Updated `config.js` to use `127.0.0.1` and port `4173` for stability.
- Frontend: `http://127.0.0.1:4173`
- Backend API: `http://127.0.0.1:5000/api`

## 🛠️ Troubleshooting
- **Connection Refused**: Ensure servers are running. Use `127.0.0.1` instead of `localhost`.
- **Tests Fail**: Check backend logs for errors. Ensure clean database state.
- **Headless Mode**: Run `npm run test:headless`.
