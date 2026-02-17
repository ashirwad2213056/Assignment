import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import './Orders.css';

const statusColors = {
    pending: '#ff9800',
    confirmed: '#2196F3',
    processing: '#9c27b0',
    shipped: '#00bcd4',
    delivered: '#4CAF50',
    cancelled: '#f44336'
};

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getMyOrders();
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load orders');
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await orderAPI.cancelOrder(orderId);
                fetchOrders();
            } catch (err) {
                setError(err.message || 'Failed to cancel order');
            }
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="orders-loading">Loading orders...</div>;

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h1>My Orders</h1>
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>

            {error && <div className="orders-error">{error}</div>}

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="no-orders-icon">📋</div>
                    <h2>No orders yet</h2>
                    <p>Start shopping and your orders will appear here.</p>
                    <button className="shop-btn" onClick={() => navigate('/products')}>
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-card-header">
                                <div>
                                    <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                                    <span className="order-date">{formatDate(order.createdAt)}</span>
                                </div>
                                <span
                                    className="order-status-badge"
                                    style={{ backgroundColor: statusColors[order.status] || '#888' }}
                                >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>

                            <div className="order-items-preview">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-card-footer">
                                <div className="order-total">
                                    Total: <strong>${order.totalPrice.toFixed(2)}</strong>
                                </div>
                                <div className="order-actions">
                                    <button
                                        className="view-order-btn"
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                    >
                                        View Details
                                    </button>
                                    {['pending', 'confirmed'].includes(order.status) && (
                                        <button
                                            className="cancel-order-btn"
                                            onClick={() => handleCancelOrder(order._id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
