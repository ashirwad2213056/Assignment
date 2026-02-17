const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get user profile (current user)
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('registeredEvents')
            .populate('createdEvents');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, email, phone, businessName, businessDescription, serviceCategory } = req.body;

        const fieldsToUpdate = {
            name,
            email,
            phone
        };

        // Add vendor fields if user is vendor
        if (req.user.role === 'vendor') {
            fieldsToUpdate.businessName = businessName;
            fieldsToUpdate.businessDescription = businessDescription;
            fieldsToUpdate.serviceCategory = serviceCategory;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'registeredEvents',
                options: { sort: { date: 1 } }
            })
            .populate({
                path: 'createdEvents',
                options: { sort: { date: -1 } }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Calculate statistics
        const stats = {
            totalRegisteredEvents: user.registeredEvents.length,
            totalCreatedEvents: user.createdEvents.length,
            upcomingEvents: user.registeredEvents.filter(
                event => new Date(event.date) > new Date()
            ).length,
            pastEvents: user.registeredEvents.filter(
                event => new Date(event.date) <= new Date()
            ).length
        };

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    businessName: user.businessName,
                    businessDescription: user.businessDescription,
                    serviceCategory: user.serviceCategory,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt
                },
                stats,
                registeredEvents: user.registeredEvents,
                createdEvents: user.createdEvents
            }
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Soft delete - deactivate account instead of removing
        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
