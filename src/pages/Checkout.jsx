import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI, orderAPI } from '../services/api';
import './Checkout.css';

const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        paymentMethod: 'cod',
        notes: ''
    });

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
            if (!response.data || response.data.items.length === 0) {
                navigate('/cart');
                return;
            }
            setCart(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load cart');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
            setError('Please fill in all address fields');
            return;
        }

        try {
            setSubmitting(true);
            const orderData = {
                shippingAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country
                },
                paymentMethod: formData.paymentMethod,
                notes: formData.notes
            };

            const response = await orderAPI.checkout(orderData);
            navigate(`/orders/${response.data._id}`, { state: { justPlaced: true } });
        } catch (err) {
            setError(err.message || 'Failed to place order');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="checkout-loading">Loading checkout...</div>;

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2>Shipping Address</h2>
                        <div className="form-group">
                            <label>Street Address</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="123 Main Street"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Mumbai"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Maharashtra"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ZIP Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    placeholder="400001"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Payment Method</h2>
                        <div className="payment-options">
                            <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={formData.paymentMethod === 'cod'}
                                    onChange={handleChange}
                                />
                                <span className="payment-icon">💵</span>
                                <span>Cash on Delivery</span>
                            </label>
                            <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={formData.paymentMethod === 'card'}
                                    onChange={handleChange}
                                />
                                <span className="payment-icon">💳</span>
                                <span>Credit/Debit Card</span>
                            </label>
                            <label className={`payment-option ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="upi"
                                    checked={formData.paymentMethod === 'upi'}
                                    onChange={handleChange}
                                />
                                <span className="payment-icon">📱</span>
                                <span>UPI</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Additional Notes</h2>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any special instructions..."
                            rows="3"
                        />
                    </div>

                    <button type="submit" className="place-order-btn" disabled={submitting}>
                        {submitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                </form>

                <div className="order-summary-panel">
                    <h2>Order Summary</h2>
                    <div className="summary-items">
                        {cart && cart.items.map(item => (
                            <div key={item._id} className="summary-item">
                                <div className="summary-item-info">
                                    <span className="summary-item-name">{item.product?.name}</span>
                                    <span className="summary-item-qty">x{item.quantity}</span>
                                </div>
                                <span className="summary-item-price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-total-row">
                        <span>Total</span>
                        <span className="summary-total-price">${cart?.totalPrice?.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
