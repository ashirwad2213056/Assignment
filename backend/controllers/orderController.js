const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create order from cart (checkout)
// @route   POST /api/orders/checkout
// @access  Private
exports.checkout = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, notes } = req.body;

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city ||
            !shippingAddress.state || !shippingAddress.zipCode) {
            return res.status(400).json({
                success: false,
                error: 'Complete shipping address is required'
            });
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price isAvailable');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cart is empty. Add items before checkout.'
            });
        }

        // Validate all products are still available
        for (const item of cart.items) {
            if (!item.product) {
                return res.status(400).json({
                    success: false,
                    error: 'One or more products in your cart are no longer available'
                });
            }
            if (!item.product.isAvailable) {
                return res.status(400).json({
                    success: false,
                    error: `"${item.product.name}" is no longer available`
                });
            }
        }

        // Build order items from cart
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price // Use current price
        }));

        // Calculate total from current prices
        const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalPrice,
            shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            notes: notes || '',
            status: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
        });

        // Clear the cart after successful order
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all orders for logged-in user
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort('-createdAt')
            .populate('items.product', 'name images category');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name images category vendor')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Only allow the order owner or admin to view
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Update order status (admin/vendor)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        order.status = status;

        // Update payment status if delivered
        if (status === 'delivered' && order.paymentMethod === 'cod') {
            order.paymentStatus = 'paid';
        }

        // If cancelled, mark refund if already paid
        if (status === 'cancelled' && order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this order'
            });
        }

        // Only allow cancellation of pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: 'Order can only be cancelled when pending or confirmed'
            });
        }

        order.status = 'cancelled';
        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort('-createdAt')
            .populate('user', 'name email')
            .populate('items.product', 'name category');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
