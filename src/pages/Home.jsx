import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { healthCheck } from '../services/api'
import './Home.css'

const Home = () => {
    const { user } = useAuth()
    const [apiStatus, setApiStatus] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        healthCheck()
            .then(data => {
                setApiStatus(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-badge">✨ Your all-in-one event platform</span>
                    <h1 className="hero-title">
                        Discover, Create &amp;<br />
                        Manage <span className="hero-highlight">Amazing Events</span>
                    </h1>
                    <p className="hero-subtitle">
                        From intimate gatherings to grand conferences — organize events,
                        manage vendors, sell products, and track orders in one place.
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link to="/dashboard" className="btn-hero-primary">Go to Dashboard →</Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-hero-primary">Get Started Free</Link>
                                <Link to="/login" className="btn-hero-secondary">Sign In →</Link>
                            </>
                        )}
                    </div>

                    {/* System Status */}
                    <div className="status-row">
                        <span className={`status-indicator ${apiStatus?.status === 'healthy' ? 'online' : loading ? 'loading' : 'offline'}`}></span>
                        <span className="status-text">
                            {loading ? 'Connecting...' : apiStatus?.status === 'healthy' ? 'All systems operational' : 'Backend offline'}
                        </span>
                        {apiStatus?.database && (
                            <>
                                <span className="status-sep">•</span>
                                <span className={`status-text ${apiStatus.database === 'connected' ? 'text-green' : 'text-red'}`}>
                                    DB: {apiStatus.database}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <h2 className="section-title">Everything you need</h2>
                <p className="section-subtitle">A complete platform for event management, vendor coordination, and e-commerce.</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: '#eef2ff' }}>📅</div>
                        <h3>Event Management</h3>
                        <p>Create, publish and manage events. Track attendees and registrations in real-time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: '#f0fdf4' }}>🏪</div>
                        <h3>Vendor Dashboard</h3>
                        <p>Vendors can manage their products, track sales, and coordinate with event organizers.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: '#fefce8' }}>📦</div>
                        <h3>Product Marketplace</h3>
                        <p>Browse and purchase products from various vendors with category filters and search.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: '#fdf2f8' }}>🛒</div>
                        <h3>Cart &amp; Checkout</h3>
                        <p>Full shopping cart with multiple payment options — COD, Card, or UPI.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: '#ecfeff' }}>📋</div>
                        <h3>Order Tracking</h3>
                        <p>Real-time order status tracking from placement through delivery with step indicators.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: '#fef2f2' }}>⚙️</div>
                        <h3>Admin Panel</h3>
                        <p>Full admin control — manage users, vendors, products and orders from one dashboard.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to get started?</h2>
                    <p>Join thousands of organizers and vendors on EventHub.</p>
                    <div className="cta-actions">
                        {user ? (
                            <Link to="/dashboard" className="btn-hero-primary">Open Dashboard</Link>
                        ) : (
                            <Link to="/register" className="btn-hero-primary">Create Free Account</Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <p>© 2026 EventHub — Event Management System. Built with React, Express &amp; MongoDB.</p>
            </footer>
        </div>
    )
}

export default Home
