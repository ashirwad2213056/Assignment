import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to={user ? '/dashboard' : '/'} className="navbar-brand">
                    <span className="brand-icon">🎪</span>
                    <span className="brand-text">EventHub</span>
                </Link>

                <div className="navbar-links">
                    {user ? (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                                Dashboard
                            </Link>
                            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                                Products
                            </Link>
                            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
                                Orders
                            </Link>
                            <Link to="/cart" className={`nav-link nav-cart ${isActive('/cart') ? 'active' : ''}`}>
                                🛒 Cart
                            </Link>
                            {user.role === 'vendor' && (
                                <Link to="/vendor/dashboard" className={`nav-link ${isActive('/vendor/dashboard') ? 'active' : ''}`}>
                                    Vendor
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin" className={`nav-link nav-admin ${isActive('/admin') ? 'active' : ''}`}>
                                    ⚙️ Admin
                                </Link>
                            )}
                            <div className="nav-divider"></div>
                            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                                <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                                <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
                            </Link>
                            <button className="nav-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                                Products
                            </Link>
                            <Link to="/login" className="nav-link">
                                Login
                            </Link>
                            <Link to="/register" className="nav-cta">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
