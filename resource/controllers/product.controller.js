const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /api/products - Return all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Error fetching products', 
            error: error.message 
        });
    }
};

// GET /api/products/:id - Return one product; return 404 if not found
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Error retrieving product', 
            error: error.message 
        });
    }
};

// POST /api/products - Create a product after validating required fields
exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, stock } = req.body;

        const errors = [];
        if (!name || typeof name !== 'string' || name.trim() === '') {
            errors.push('Name is required');
        }
        if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
            errors.push('Price is required and must be a number greater than or equal to 0');
        }
        if (!category || typeof category !== 'string' || category.trim() === '') {
            errors.push('Category is required');
        }
        if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
            errors.push('Stock is required and must be an integer greater than or equal to 0');
        }

        if (errors.length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors 
            });
        }

        const newProduct = new Product({
            name: name.trim(),
            price: Number(price),
            category: category.trim(),
            stock: Number(stock)
        });

        const savedProduct = await newProduct.save();
        return res.status(201).json(savedProduct);
    } catch (error) {
        return res.status(400).json({ 
            message: 'Error creating product', 
            error: error.message 
        });
    }
};

// PUT /api/products/:id - Update a product; return 404 if not found
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, price, category, stock } = req.body;

        if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
            return res.status(400).json({ message: 'Price must be greater than or equal to 0' });
        }
        if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
            return res.status(400).json({ message: 'Stock must be greater than or equal to 0' });
        }

        const updatedData = {};
        if (name !== undefined) updatedData.name = name.trim();
        if (price !== undefined) updatedData.price = Number(price);
        if (category !== undefined) updatedData.category = category.trim();
        if (stock !== undefined) updatedData.stock = Number(stock);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        return res.status(200).json(updatedProduct);
    } catch (error) {
        return res.status(400).json({ 
            message: 'Error updating product', 
            error: error.message 
        });
    }
};

// DELETE /api/products/:id - Delete only if no Order item references the product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if any Order references this product
        const referencedOrder = await Order.findOne({ 'items.product_id': id });
        if (referencedOrder) {
            return res.status(409).json({ 
                message: 'Cannot delete product: product is referenced in one or more orders',
                orderId: referencedOrder._id
            });
        }

        await Product.findByIdAndDelete(id);
        return res.status(200).json({ 
            message: 'Product deleted successfully', 
            id 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Error deleting product', 
            error: error.message 
        });
    }
};
