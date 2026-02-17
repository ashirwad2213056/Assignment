const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getVendorProducts,
    getMyProducts
} = require('../controllers/productController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getProducts)
    .post(protect, authorize('vendor', 'admin'), createProduct);

router.route('/myproducts').get(protect, authorize('vendor', 'admin'), getMyProducts);

router.route('/vendor/:vendorId').get(getVendorProducts);

router
    .route('/:id')
    .get(getProduct)
    .put(protect, authorize('vendor', 'admin'), updateProduct)
    .delete(protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
