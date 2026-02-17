import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { register, error, clearError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        phone: '',
        businessName: '',
        businessDescription: '',
        serviceCategory: '',
    });

    const handleChange = (e) => {
        clearError();
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword: _, ...registrationData } = formData;
            await register(registrationData);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container auth-wide">
                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>Join EventHub to manage events and more</p>
                </div>

                <div className="auth-card">
                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Account Type</label>
                                <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                                    <option value="user">User (Attendee)</option>
                                    <option value="vendor">Vendor (Service Provider)</option>
                                </select>
                            </div>
                        </div>

                        {formData.role === 'vendor' && (
                            <div className="vendor-section">
                                <h3>Vendor Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="businessName">Business Name</label>
                                        <input id="businessName" type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Your Business Name" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="serviceCategory">Service Category</label>
                                        <select id="serviceCategory" name="serviceCategory" value={formData.serviceCategory} onChange={handleChange}>
                                            <option value="">Select category</option>
                                            <option value="catering">Catering</option>
                                            <option value="decoration">Decoration</option>
                                            <option value="photography">Photography</option>
                                            <option value="venue">Venue</option>
                                            <option value="entertainment">Entertainment</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="businessDescription">Business Description</label>
                                    <textarea id="businessDescription" name="businessDescription" value={formData.businessDescription} onChange={handleChange} rows={3} placeholder="Tell us about your business and services..."></textarea>
                                </div>
                            </div>
                        )}

                        <div className="auth-info">
                            <strong>Password requirements:</strong> Minimum 6 characters
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
