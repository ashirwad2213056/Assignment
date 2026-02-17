import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProductList.css';

const ProductList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const [cartMessage, setCartMessage] = useState(null);
    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        sort: '-createdAt'
    });

    // Debounce keyword search
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(filters.keyword);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.keyword]);

    useEffect(() => {
        fetchProducts();
    }, [debouncedKeyword, filters.category, filters.sort]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = { ...filters };
            if (!queryParams.category) delete queryParams.category;
            queryParams.keyword = debouncedKeyword;

            const response = await productAPI.getAll(queryParams);
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddToCart = async (productId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setAddingToCart(productId);
            await cartAPI.addToCart(productId, 1);
            setCartMessage('Added to cart!');
            setTimeout(() => setCartMessage(null), 2000);
        } catch (err) {
            setCartMessage('Failed to add to cart');
            setTimeout(() => setCartMessage(null), 2000);
        } finally {
            setAddingToCart(null);
        }
    };

    return (
        <div className="product-list-container">
            <div className="product-list-header">
                <h1>Browse Products</h1>
                {user && (
                    <button className="cart-nav-btn" onClick={() => navigate('/cart')}>
                        🛒 View Cart
                    </button>
                )}
            </div>

            {cartMessage && <div className="cart-toast">{cartMessage}</div>}

            <div className="filters-section">
                <div className="search-bar">
                    <input
                        type="text"
                        name="keyword"
                        placeholder="Search products..."
                        value={filters.keyword}
                        onChange={handleFilterChange}
                        className="search-input"
                    />
                </div>

                <div className="filter-options">
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Categories</option>
                        <option value="Catering">Catering</option>
                        <option value="Decoration">Decoration</option>
                        <option value="Photography">Photography</option>
                        <option value="Venue">Venue</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="-createdAt">Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="name">Name: A-Z</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="products-grid">
                    {products.length === 0 ? (
                        <div className="no-results">No products found matching your criteria.</div>
                    ) : (
                        products.map(product => (
                            <div key={product._id} className="product-card">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0]} alt={product.name} className="product-image" />
                                ) : (
                                    <div className="product-image-placeholder">No Image</div>
                                )}
                                <div className="product-info">
                                    <h3 className="product-title">{product.name}</h3>
                                    <p className="product-vendor">By {product.vendor?.businessName || product.vendor?.name}</p>
                                    <div className="product-meta">
                                        <span className="product-category">{product.category}</span>
                                        <span className="product-price">${product.price}</span>
                                    </div>
                                    <p className="product-description">
                                        {product.description ? product.description.substring(0, 100) : ''}...
                                    </p>
                                    <div className="product-actions">
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(product._id)}
                                            disabled={addingToCart === product._id}
                                        >
                                            {addingToCart === product._id ? 'Adding...' : '🛒 Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductList;
