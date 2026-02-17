import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);

    // Filters
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        loadTabData(activeTab);
    }, [user, navigate, activeTab]);

    const showMessage = (msg) => {
        setActionMessage(msg);
        setTimeout(() => setActionMessage(null), 3000);
    };

    const loadTabData = async (tab) => {
        try {
            setLoading(true);
            setError(null);

            switch (tab) {
                case 'dashboard':
                    const statsRes = await adminAPI.getStats();
                    setStats(statsRes.data);
                    break;
                case 'users':
                    const params = {};
                    if (userRoleFilter) params.role = userRoleFilter;
                    if (userSearch) params.search = userSearch;
                    const usersRes = await adminAPI.getUsers(params);
                    setUsers(usersRes.data);
                    break;
                case 'products':
                    const productsRes = await adminAPI.getProducts();
                    setProducts(productsRes.data);
                    break;
                case 'orders':
                    const orderParams = {};
                    if (orderStatusFilter) orderParams.status = orderStatusFilter;
                    const ordersRes = await adminAPI.getOrders(orderParams);
                    setOrders(ordersRes.data);
                    break;
                default:
                    break;
            }
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to load data');
            setLoading(false);
        }
    };

    // User actions
    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            showMessage('Role updated!');
            loadTabData('users');
        } catch (err) {
            showMessage('Failed to update role');
        }
    };

    const handleToggleUser = async (userId) => {
        try {
            await adminAPI.toggleUserStatus(userId);
            showMessage('User status toggled!');
            loadTabData('users');
        } catch (err) {
            showMessage('Failed to toggle status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Permanently delete this user? This cannot be undone.')) {
            try {
                await adminAPI.deleteUser(userId);
                showMessage('User deleted');
                loadTabData('users');
            } catch (err) {
                showMessage(err.message || 'Failed to delete user');
            }
        }
    };

    // Product actions
    const handleToggleProduct = async (productId) => {
        try {
            await adminAPI.toggleProduct(productId);
            showMessage('Product availability toggled!');
            loadTabData('products');
        } catch (err) {
            showMessage('Failed to toggle product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Delete this product?')) {
            try {
                await adminAPI.deleteProduct(productId);
                showMessage('Product deleted');
                loadTabData('products');
            } catch (err) {
                showMessage('Failed to delete product');
            }
        }
    };

    // Order actions
    const handleOrderStatus = async (orderId, status) => {
        try {
            await adminAPI.updateOrderStatus(orderId, status);
            showMessage(`Order ${status}!`);
            loadTabData('orders');
        } catch (err) {
            showMessage('Failed to update order');
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    // ==================== RENDER TABS ====================

    const renderDashboard = () => {
        if (!stats) return null;
        return (
            <div className="admin-stats-grid">
                <div className="stat-card stat-users">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalUsers}</span>
                        <span className="stat-label">Users</span>
                    </div>
                </div>
                <div className="stat-card stat-vendors">
                    <div className="stat-icon">🏪</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalVendors}</span>
                        <span className="stat-label">Vendors</span>
                    </div>
                </div>
                <div className="stat-card stat-products">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalProducts}</span>
                        <span className="stat-label">Products</span>
                    </div>
                </div>
                <div className="stat-card stat-orders">
                    <div className="stat-icon">🛍️</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalOrders}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.pendingOrders}</span>
                        <span className="stat-label">Pending Orders</span>
                    </div>
                </div>
                <div className="stat-card stat-revenue">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-number">${stats.totalRevenue?.toFixed(2)}</span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderUsers = () => (
        <div className="admin-table-section">
            <div className="table-controls">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadTabData('users')}
                    className="admin-search"
                />
                <select
                    value={userRoleFilter}
                    onChange={(e) => { setUserRoleFilter(e.target.value); }}
                    className="admin-filter"
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                    <option value="organizer">Organizer</option>
                </select>
                <button className="filter-apply-btn" onClick={() => loadTabData('users')}>
                    Apply
                </button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id}>
                            <td className="user-name">{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                                <select
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                    className="role-select"
                                >
                                    <option value="user">User</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                    <option value="organizer">Organizer</option>
                                </select>
                            </td>
                            <td>
                                <span className={`status-dot ${u.isActive !== false ? 'active' : 'inactive'}`}>
                                    {u.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>{formatDate(u.createdAt)}</td>
                            <td className="action-cell">
                                <button
                                    className="action-btn toggle-btn"
                                    onClick={() => handleToggleUser(u._id)}
                                    title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                                >
                                    {u.isActive !== false ? '🚫' : '✅'}
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteUser(u._id)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && <p className="no-data">No users found</p>}
        </div>
    );

    const renderProducts = () => (
        <div className="admin-table-section">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Vendor</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p._id}>
                            <td className="user-name">{p.name}</td>
                            <td>{p.vendor?.businessName || p.vendor?.name || 'N/A'}</td>
                            <td><span className="category-badge">{p.category}</span></td>
                            <td className="price-cell">${p.price?.toFixed(2)}</td>
                            <td>
                                <span className={`status-dot ${p.isAvailable ? 'active' : 'inactive'}`}>
                                    {p.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                            </td>
                            <td className="action-cell">
                                <button
                                    className="action-btn toggle-btn"
                                    onClick={() => handleToggleProduct(p._id)}
                                    title="Toggle availability"
                                >
                                    {p.isAvailable ? '🚫' : '✅'}
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteProduct(p._id)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {products.length === 0 && <p className="no-data">No products found</p>}
        </div>
    );

    const renderOrders = () => (
        <div className="admin-table-section">
            <div className="table-controls">
                <select
                    value={orderStatusFilter}
                    onChange={(e) => { setOrderStatusFilter(e.target.value); loadTabData('orders'); }}
                    className="admin-filter"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o._id}>
                            <td className="order-id-cell">#{o._id.slice(-8).toUpperCase()}</td>
                            <td>{o.user?.name || 'N/A'}</td>
                            <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                            <td className="price-cell">${o.totalPrice?.toFixed(2)}</td>
                            <td>
                                <select
                                    value={o.status}
                                    onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </td>
                            <td>{formatDate(o.createdAt)}</td>
                            <td>
                                <button
                                    className="action-btn view-btn"
                                    onClick={() => navigate(`/orders/${o._id}`)}
                                    title="View Details"
                                >
                                    👁️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && <p className="no-data">No orders found</p>}
        </div>
    );

    return (
        <div className="admin-container">
            {actionMessage && <div className="admin-toast">{actionMessage}</div>}

            <div className="admin-header">
                <h1>Admin Panel</h1>
                <button className="admin-back-btn" onClick={() => navigate('/dashboard')}>
                    ← Dashboard
                </button>
            </div>

            <nav className="admin-nav">
                {['dashboard', 'users', 'products', 'orders'].map(tab => (
                    <button
                        key={tab}
                        className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'dashboard' && '📊 '}
                        {tab === 'users' && '👥 '}
                        {tab === 'products' && '📦 '}
                        {tab === 'orders' && '🛍️ '}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </nav>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-content">
                {loading ? (
                    <div className="admin-loading">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'products' && renderProducts()}
                        {activeTab === 'orders' && renderOrders()}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
