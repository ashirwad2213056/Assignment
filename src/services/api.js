// Base API URL - adjust based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Authentication API functions
export const authAPI = {
    // Register new user
    register: async (userData) => {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (data.token) {
            setToken(data.token);
        }
        return data;
    },

    // Login user
    login: async (credentials) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (data.token) {
            setToken(data.token);
        }
        return data;
    },

    // Logout user
    logout: () => {
        removeToken();
        return Promise.resolve({ success: true });
    },

    // Get current user
    getMe: () => apiRequest('/auth/me'),

    // Update profile
    updateProfile: (profileData) => apiRequest('/auth/updateprofile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    }),

    // Update password
    updatePassword: (passwordData) => apiRequest('/auth/updatepassword', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
    }),
};

// User API functions
export const userAPI = {
    // Get user profile
    getProfile: () => apiRequest('/users/profile'),

    // Update user profile
    updateProfile: (profileData) => apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    }),

    // Delete account
    deleteAccount: () => apiRequest('/users/profile', {
        method: 'DELETE',
    }),

    // Get dashboard data
    getDashboard: () => apiRequest('/users/dashboard'),

    // Get all users (admin)
    getAll: () => apiRequest('/users'),

    // Get single user by ID
    getById: (id) => apiRequest(`/users/${id}`),
};

// Event API functions
export const eventAPI = {
    // Get all events
    getAll: () => apiRequest('/events'),

    // Get single event by ID
    getById: (id) => apiRequest(`/events/${id}`),

    // Create new event
    create: (eventData) => apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
    }),

    // Update event
    update: (id, eventData) => apiRequest(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
    }),

    // Delete event
    delete: (id) => apiRequest(`/events/${id}`, {
        method: 'DELETE',
    }),
};

// Health check
export const healthCheck = () => apiRequest('/health');

// Export token utilities
export const tokenUtils = {
    getToken,
    setToken,
    removeToken,
    isAuthenticated: () => !!getToken(),
};

// Product API functions
export const productAPI = {
    // Get all products
    getAll: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        const queryString = queryParams.toString();
        return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
    },

    // Get single product by ID
    getById: (id) => apiRequest(`/products/${id}`),

    // Create new product
    create: (productData) => apiRequest('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` })
        },
        body: JSON.stringify(productData),
    }),

    // Update product
    update: (id, productData) => apiRequest(`/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(getToken() && { Authorization: `Bearer ${getToken()}` })
        },
        body: JSON.stringify(productData),
    }),

    // Delete product
    delete: (id) => apiRequest(`/products/${id}`, {
        method: 'DELETE',
        headers: {
            ...(getToken() && { Authorization: `Bearer ${getToken()}` })
        },
    }),

    // Get vendor products
    getVendorProducts: (vendorId) => apiRequest(`/products/vendor/${vendorId}`),

    // Get my products
    getMyProducts: () => apiRequest('/products/myproducts', {
        headers: {
            ...(getToken() && { Authorization: `Bearer ${getToken()}` })
        }
    }),
};

// Cart API functions
export const cartAPI = {
    // Get current user's cart
    getCart: () => apiRequest('/cart'),

    // Add item to cart
    addToCart: (productId, quantity = 1) => apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
    }),

    // Update item quantity
    updateItem: (itemId, quantity) => apiRequest(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    }),

    // Remove item from cart
    removeItem: (itemId) => apiRequest(`/cart/${itemId}`, {
        method: 'DELETE',
    }),

    // Clear entire cart
    clearCart: () => apiRequest('/cart', {
        method: 'DELETE',
    }),
};

// Order API functions
export const orderAPI = {
    // Checkout (create order from cart)
    checkout: (orderData) => apiRequest('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),

    // Get my orders
    getMyOrders: () => apiRequest('/orders'),

    // Get single order
    getOrder: (id) => apiRequest(`/orders/${id}`),

    // Cancel order
    cancelOrder: (id) => apiRequest(`/orders/${id}/cancel`, {
        method: 'PUT',
    }),

    // Update order status (admin)
    updateStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    }),

    // Get all orders (admin)
    getAllOrders: () => apiRequest('/orders/all'),
};

// Admin API functions
export const adminAPI = {
    // Dashboard stats
    getStats: () => apiRequest('/admin/stats'),

    // User management
    getUsers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
    },
    updateUserRole: (id, role) => apiRequest(`/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    }),
    toggleUserStatus: (id) => apiRequest(`/admin/users/${id}/status`, {
        method: 'PUT',
    }),
    deleteUser: (id) => apiRequest(`/admin/users/${id}`, {
        method: 'DELETE',
    }),

    // Product management
    getProducts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/products${query ? `?${query}` : ''}`);
    },
    toggleProduct: (id) => apiRequest(`/admin/products/${id}/toggle`, {
        method: 'PUT',
    }),
    deleteProduct: (id) => apiRequest(`/admin/products/${id}`, {
        method: 'DELETE',
    }),

    // Order management
    getOrders: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/orders${query ? `?${query}` : ''}`);
    },
    updateOrderStatus: (id, status) => apiRequest(`/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    }),
};

export default { authAPI, userAPI, eventAPI, productAPI, cartAPI, orderAPI, adminAPI, healthCheck, tokenUtils };
