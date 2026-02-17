import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, orderAPI, cartAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [dashRes, ordersRes, cartRes] = await Promise.allSettled([
                userAPI.getDashboard(),
                orderAPI.getMyOrders(),
                cartAPI.getCart()
            ]);

            if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value.data);
            if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value.data.slice(0, 3));
            if (cartRes.status === 'fulfilled') setCartCount(cartRes.value.data?.items?.length || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric'
    });

    const statusColor = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        processing: '#8b5cf6',
        shipped: '#06b6d4',
        delivered: '#22c55e',
        cancelled: '#ef4444',
    };

    if (loading) {
        return (
            <div className="dash-loading">
                <div className="dash-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dash-error-page">
                <p>Error: {error}</p>
                <button onClick={fetchAll} className="dash-retry-btn">Retry</button>
            </div>
        );
    }

    const stats = dashboardData?.stats || {};
    const userName = dashboardData?.user?.name || user?.name || 'User';
    const userRole = dashboardData?.user?.role || user?.role || 'user';

    return (
        <div className="dashboard">
            {/* Welcome */}
            <section className="dash-welcome">
                <div>
                    <h1>Welcome back, {userName.split(' ')[0]}! 👋</h1>
                    <p>Here's an overview of your activities and quick actions.</p>
                </div>
                <span className="dash-role-badge">{userRole}</span>
            </section>

            {/* Stats */}
            <section className="dash-stats">
                <div className="stat-card stat-blue" onClick={() => navigate('/events')}>
                    <div className="stat-icon-wrap">📅</div>
                    <div className="stat-detail">
                        <span className="stat-num">{stats.totalRegisteredEvents || 0}</span>
                        <span className="stat-lbl">Registered Events</span>
                    </div>
                </div>
                <div className="stat-card stat-green" onClick={() => navigate('/events')}>
                    <div className="stat-icon-wrap">🔜</div>
                    <div className="stat-detail">
                        <span className="stat-num">{stats.upcomingEvents || 0}</span>
                        <span className="stat-lbl">Upcoming</span>
                    </div>
                </div>
                <div className="stat-card stat-purple" onClick={() => navigate('/orders')}>
                    <div className="stat-icon-wrap">📋</div>
                    <div className="stat-detail">
                        <span className="stat-num">{recentOrders.length}</span>
                        <span className="stat-lbl">Recent Orders</span>
                    </div>
                </div>
                <div className="stat-card stat-amber" onClick={() => navigate('/cart')}>
                    <div className="stat-icon-wrap">🛒</div>
                    <div className="stat-detail">
                        <span className="stat-num">{cartCount}</span>
                        <span className="stat-lbl">Cart Items</span>
                    </div>
                </div>
            </section>

            {/* Quick Actions + Recent Orders */}
            <div className="dash-grid">
                {/* Quick Actions */}
                <section className="dash-panel">
                    <h2 className="panel-title">Quick Actions</h2>
                    <div className="quick-actions">
                        <button className="qa-btn" onClick={() => navigate('/products')}>
                            <span className="qa-icon">📦</span>
                            <span className="qa-text">Browse Products</span>
                        </button>
                        <button className="qa-btn" onClick={() => navigate('/cart')}>
                            <span className="qa-icon">🛒</span>
                            <span className="qa-text">View Cart</span>
                        </button>
                        <button className="qa-btn" onClick={() => navigate('/orders')}>
                            <span className="qa-icon">📋</span>
                            <span className="qa-text">My Orders</span>
                        </button>
                        <button className="qa-btn" onClick={() => navigate('/profile')}>
                            <span className="qa-icon">👤</span>
                            <span className="qa-text">Edit Profile</span>
                        </button>
                        {userRole === 'vendor' && (
                            <button className="qa-btn qa-vendor" onClick={() => navigate('/vendor/dashboard')}>
                                <span className="qa-icon">🏪</span>
                                <span className="qa-text">Vendor Panel</span>
                            </button>
                        )}
                        {userRole === 'admin' && (
                            <button className="qa-btn qa-admin" onClick={() => navigate('/admin')}>
                                <span className="qa-icon">⚙️</span>
                                <span className="qa-text">Admin Panel</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* Recent Orders */}
                <section className="dash-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Recent Orders</h2>
                        <button className="panel-link" onClick={() => navigate('/orders')}>View all →</button>
                    </div>
                    {recentOrders.length > 0 ? (
                        <div className="recent-orders">
                            {recentOrders.map(order => (
                                <div
                                    key={order._id}
                                    className="order-row"
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                >
                                    <div className="order-row-left">
                                        <span className="order-hash">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className="order-row-date">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="order-row-right">
                                        <span className="order-row-price">${order.totalPrice?.toFixed(2)}</span>
                                        <span
                                            className="order-row-status"
                                            style={{ backgroundColor: `${statusColor[order.status]}15`, color: statusColor[order.status] }}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-panel">
                            <p>No orders yet</p>
                            <button className="empty-cta" onClick={() => navigate('/products')}>
                                Start Shopping →
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Events Section */}
            <div className="dash-grid">
                <section className="dash-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Registered Events</h2>
                        <button className="panel-link" onClick={() => navigate('/events')}>Browse →</button>
                    </div>
                    {dashboardData?.registeredEvents?.length > 0 ? (
                        <div className="event-list">
                            {dashboardData.registeredEvents.slice(0, 4).map(event => (
                                <div key={event._id} className="event-item">
                                    <div className="event-item-info">
                                        <h4>{event.title}</h4>
                                        <span className="event-meta">📅 {new Date(event.date).toLocaleDateString()} • 📍 {event.location}</span>
                                    </div>
                                    {event.status && (
                                        <span className={`event-status-tag ${event.status}`}>{event.status}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-panel">
                            <p>No registered events</p>
                            <button className="empty-cta" onClick={() => navigate('/events')}>
                                Browse Events →
                            </button>
                        </div>
                    )}
                </section>

                {(userRole !== 'user') && (
                    <section className="dash-panel">
                        <h2 className="panel-title">Created Events</h2>
                        {dashboardData?.createdEvents?.length > 0 ? (
                            <div className="event-list">
                                {dashboardData.createdEvents.slice(0, 4).map(event => (
                                    <div key={event._id} className="event-item">
                                        <div className="event-item-info">
                                            <h4>{event.title}</h4>
                                            <span className="event-meta">👥 {event.attendees?.length || 0} attendees • 📅 {new Date(event.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-panel">
                                <p>No created events</p>
                                <button className="empty-cta" onClick={() => navigate('/events/create')}>
                                    Create Event →
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
