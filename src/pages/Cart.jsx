import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI } from '../services/api';
import './Cart.css';

const Cart = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null); // track which item is being updated

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.getCart();
            setCart(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load cart');
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            setUpdating(itemId);
            const response = await cartAPI.updateItem(itemId, newQuantity);
            setCart(response.data);
        } catch (err) {
            setError('Failed to update quantity');
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            setUpdating(itemId);
            const response = await cartAPI.removeItem(itemId);
            setCart(response.data);
        } catch (err) {
            setError('Failed to remove item');
        } finally {
            setUpdating(null);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                const response = await cartAPI.clearCart();
                setCart(response.data);
            } catch (err) {
                setError('Failed to clear cart');
            }
        }
    };

    if (loading) return <div className="cart-loading">Loading cart...</div>;

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h1>Your Cart</h1>
                <button className="back-btn" onClick={() => navigate('/products')}>
                    ← Continue Shopping
                </button>
            </div>

            {error && <div className="cart-error">{error}</div>}

            {!cart || cart.items.length === 0 ? (
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Browse products and add items to your cart.</p>
                    <button className="shop-btn" onClick={() => navigate('/products')}>
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {cart.items.map(item => (
                            <div key={item._id} className={`cart-item ${updating === item._id ? 'updating' : ''}`}>
                                <div className="item-image">
                                    {item.product?.images && item.product.images.length > 0 ? (
                                        <img src={item.product.images[0]} alt={item.product?.name} />
                                    ) : (
                                        <div className="image-placeholder">📦</div>
                                    )}
                                </div>
                                <div className="item-details">
                                    <h3>{item.product?.name || 'Product unavailable'}</h3>
                                    <p className="item-category">{item.product?.category}</p>
                                    <p className="item-price">${item.price?.toFixed(2)}</p>
                                </div>
                                <div className="item-quantity">
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1 || updating === item._id}
                                    >
                                        −
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                        disabled={updating === item._id}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="item-subtotal">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveItem(item._id)}
                                    disabled={updating === item._id}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Items ({cart.items.reduce((sum, i) => sum + i.quantity, 0)})</span>
                            <span>${cart.totalPrice?.toFixed(2)}</span>
                        </div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>${cart.totalPrice?.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                            Proceed to Checkout
                        </button>
                        <button className="clear-btn" onClick={handleClearCart}>
                            Clear Cart
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
