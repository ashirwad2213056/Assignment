const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getUserProfile,
    updateUserProfile,
    getDashboard,
    getAllUsers,
    getUserById,
    deleteUserAccount
} = require('../controllers/userController');

// Protected routes - require authentication
// @route   GET /api/users/profile
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
router.put('/profile', protect, updateUserProfile);

// @route   DELETE /api/users/profile
router.delete('/profile', protect, deleteUserAccount);

// @route   GET /api/users/dashboard
router.get('/dashboard', protect, getDashboard);

// Admin only routes
// @route   GET /api/users
router.get('/', protect, authorize('admin'), getAllUsers);

// Public/Protected routes
// @route   GET /api/users/:id
router.get('/:id', protect, getUserById);

module.exports = router;
