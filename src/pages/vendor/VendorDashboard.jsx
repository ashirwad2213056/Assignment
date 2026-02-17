import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productAPI } from '../../services/api';
import ProductForm from '../../components/vendor/ProductForm';
import './VendorDashboard.css';

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.role !== 'vendor') {
            navigate('/dashboard'); // Limit access to vendors
        } else {
            fetchProducts();
        }
    }, [user, navigate]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getMyProducts();
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Error fetching products');
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.delete(id);
                fetchProducts(); // Refresh list
            } catch (err) {
                setError(err.message || 'Error deleting product');
            }
        }
    };

    const handleFormSubmit = () => {
        setShowForm(false);
        fetchProducts();
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Vendor Dashboard</h1>
                <div className="user-info">
                    <p>Welcome, {user?.name} ({user?.businessName})</p>
                    <button onClick={handleAddProduct} className="add-btn">
                        + Add New Product
                    </button>
                </div>
            </header>

            {error && <div className="error-alert">{error}</div>}

            {showForm ? (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ProductForm
                            product={editingProduct}
                            onSave={handleFormSubmit}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            ) : null}

            <section className="products-section">
                <h2>Your Products</h2>
                {products.length === 0 ? (
                    <p className="no-products">You haven't added any products yet.</p>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product._id} className="product-card">
                                <h3>{product.name}</h3>
                                <p className="price">${product.price}</p>
                                <p className="category">{product.category}</p>
                                <div className="actions">
                                    <button onClick={() => handleEditProduct(product)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDeleteProduct(product._id)} className="delete-btn">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};

export default VendorDashboard;
