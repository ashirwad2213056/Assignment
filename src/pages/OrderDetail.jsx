import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import './OrderDetail.css';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const justPlaced = location.state?.justPlaced;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrder();
    }, [user, id, navigate]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getOrder(id);
            setOrder(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load order details');
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await orderAPI.cancelOrder(id);
                fetchOrder();
            } catch (err) {
                setError(err.message || 'Failed to cancel order');
            }
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIndex = (status) => {
        return statusSteps.indexOf(status);
    };

    if (loading) return <div className="od-loading">Loading order details...</div>;
    if (error) return <div className="od-error">{error}</div>;
    if (!order) return <div className="od-error">Order not found</div>;

    const isCancelled = order.status === 'cancelled';
    const currentStep = getStatusIndex(order.status);

    return (
        <div className="od-container">
            {justPlaced && (
                <div className="od-success-banner">
                    ✅ Your order has been placed successfully!
                </div>
            )}

            <div className="od-header">
                <div>
                    <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
                    <p className="od-date">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <button className="od-back-btn" onClick={() => navigate('/orders')}>
                    ← All Orders
                </button>
            </div>

            {/* Status Tracker */}
            {!isCancelled ? (
                <div className="status-tracker">
                    {statusSteps.map((step, idx) => (
                        <div
                            key={step}
                            className={`status-step ${idx <= currentStep ? 'active' : ''} ${idx === currentStep ? 'current' : ''}`}
                        >
                            <div className="step-dot"></div>
                            <span className="step-label">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="cancelled-banner">
                    ❌ This order has been cancelled
                </div>
            )}

            <div className="od-layout">
                <div className="od-main">
                    <div className="od-section">
                        <h2>Items</h2>
                        {order.items.map((item, idx) => (
                            <div key={idx} className="od-item">
                                <div className="od-item-info">
                                    <span className="od-item-name">{item.name}</span>
                                    <span className="od-item-qty">Qty: {item.quantity}</span>
                                </div>
                                <span className="od-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="od-total-row">
                            <span>Total</span>
                            <span className="od-total-price">${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="od-section">
                            <h2>Notes</h2>
                            <p className="od-notes">{order.notes}</p>
                        </div>
                    )}
                </div>

                <div className="od-sidebar">
                    <div className="od-section">
                        <h2>Shipping Address</h2>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p>{order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>

                    <div className="od-section">
                        <h2>Payment</h2>
                        <p><strong>Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI'}</p>
                        <p><strong>Status:</strong> <span className={`payment-badge ${order.paymentStatus}`}>{order.paymentStatus}</span></p>
                    </div>

                    {['pending', 'confirmed'].includes(order.status) && (
                        <button className="od-cancel-btn" onClick={handleCancel}>
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
