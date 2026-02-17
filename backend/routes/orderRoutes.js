const express = require('express');
const router = express.Router();
const {
    checkout,
    getMyOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

// User routes
router.post('/checkout', checkout);
router.get('/', getMyOrders);
router.get('/all', authorize('admin'), getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
