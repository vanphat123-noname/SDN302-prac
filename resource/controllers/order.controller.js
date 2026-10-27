const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// GET /api/orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer_id', 'name email phone address')
            .populate('items.product_id', 'name price category')
            .sort({ order_date: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving orders', error: error.message });
    }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = await Order.findById(id)
            .populate('customer_id', 'name email phone address')
            .populate('items.product_id', 'name price category');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving order', error: error.message });
    }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { customer_id, items, payment_method, status, order_date } = req.body;

        if (!customer_id || !mongoose.Types.ObjectId.isValid(customer_id)) {
            return res.status(400).json({ message: 'Valid customer_id is required' });
        }

        const customer = await Customer.findById(customer_id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items array must have at least one product' });
        }

        let total_amount = 0;
        const processedItems = [];

        for (const item of items) {
            if (!item.product_id || !mongoose.Types.ObjectId.isValid(item.product_id)) {
                return res.status(400).json({ message: 'Valid product_id is required for each item' });
            }
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product_id} not found` });
            }
            const quantity = Number(item.quantity);
            if (isNaN(quantity) || quantity < 1) {
                return res.status(400).json({ message: 'Quantity must be at least 1' });
            }
            const price_at_order = item.price_at_order !== undefined ? Number(item.price_at_order) : product.price;
            const itemTotal = price_at_order * quantity;
            total_amount += itemTotal;

            processedItems.push({
                product_id: product._id,
                quantity,
                price_at_order,
                total: itemTotal
            });
        }

        const newOrder = new Order({
            customer_id,
            items: processedItems,
            total_amount: req.body.total_amount !== undefined ? Number(req.body.total_amount) : total_amount,
            payment_method: payment_method || 'COD',
            status: status || 'Pending',
            order_date: order_date || new Date()
        });

        const savedOrder = await newOrder.save();
        const populated = await Order.findById(savedOrder._id)
            .populate('customer_id', 'name email phone address')
            .populate('items.product_id', 'name price category');

        return res.status(201).json(populated);
    } catch (error) {
        return res.status(400).json({ message: 'Error creating order', error: error.message });
    }
};
