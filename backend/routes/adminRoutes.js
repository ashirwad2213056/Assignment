const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    getAllProducts,
    toggleProduct,
    deleteProduct,
    getAllOrders,
    updateOrderStatus,
    getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Product management
router.get('/products', getAllProducts);
router.put('/products/:id/toggle', toggleProduct);
router.delete('/products/:id', deleteProduct);

// Order management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
