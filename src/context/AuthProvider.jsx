import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authAPI, tokenUtils } from '../services/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const initAuth = async () => {
            if (tokenUtils.isAuthenticated()) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.user);
                } catch (err) {
                    console.error('Auth initialization error:', err);
                    tokenUtils.removeToken();
                }
            }
            setLoading(false);
        };

        // Don't run effect if token is missing
        if (!tokenUtils.isAuthenticated()) {
            setLoading(false);
            return;
        }

        initAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateUser,
        clearError: () => setError(null),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
