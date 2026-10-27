const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const verifyToken = require('../middleware/auth.middleware');

// Protect all product routes with JWT middleware
router.use(verifyToken);

// GET /api/products - Return all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Return one product; return 404 if not found
router.get('/:id', productController.getProductById);

// POST /api/products - Create a product after validating required fields
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update a product; return 404 if not found
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete only if no Order item references the product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
