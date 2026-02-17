import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

    const [profileForm, setProfileForm] = useState({
        name: '', email: '', phone: '',
        businessName: '', businessDescription: '', serviceCategory: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                businessName: user.businessName || '',
                businessDescription: user.businessDescription || '',
                serviceCategory: user.serviceCategory || '',
            });
        }
    }, [user]);

    const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(null); setLoading(true);
        try {
            const response = await userAPI.updateProfile(profileForm);
            updateUser(response.data);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setSuccess('Password updated successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
        setLoading(true);
        try {
            await userAPI.deleteAccount();
            logout();
            navigate('/');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar-large">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1>{user?.name}</h1>
                        <p>{user?.email} • <span className="role-tag">{user?.role}</span></p>
                    </div>
                </div>

                {error && <div className="profile-alert error">{error}</div>}
                {success && <div className="profile-alert success">{success}</div>}

                <div className="profile-tabs">
                    {['profile', 'password', 'danger'].map(tab => (
                        <button
                            key={tab}
                            className={`profile-tab ${activeTab === tab ? 'active' : ''} ${tab === 'danger' ? 'danger-tab' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'profile' && '👤 Profile'}
                            {tab === 'password' && '🔒 Password'}
                            {tab === 'danger' && '⚠️ Danger Zone'}
                        </button>
                    ))}
                </div>

                <div className="profile-card">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input name="name" value={profileForm.name} onChange={handleProfileChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <div className="role-display">{user?.role?.toUpperCase()}</div>
                                </div>
                            </div>

                            {user?.role === 'vendor' && (
                                <div className="vendor-profile-section">
                                    <h3>Vendor Information</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Business Name</label>
                                            <input name="businessName" value={profileForm.businessName} onChange={handleProfileChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Service Category</label>
                                            <select name="serviceCategory" value={profileForm.serviceCategory} onChange={handleProfileChange}>
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
                                        <label>Business Description</label>
                                        <textarea name="businessDescription" value={profileForm.businessDescription} onChange={handleProfileChange} rows={3} placeholder="Tell us about your business..." />
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="profile-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
                                </div>
                            </div>
                            <div className="password-hint">
                                <strong>Password requirements:</strong> Minimum 6 characters
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setActiveTab('profile')}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'danger' && (
                        <div className="danger-zone">
                            <h3>Delete Account</h3>
                            <p>Once you delete your account, there is no going back. Please be certain.</p>
                            <button className="btn-danger" onClick={handleDeleteAccount} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
