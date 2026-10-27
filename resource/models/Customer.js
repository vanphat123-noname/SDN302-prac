const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required']
    },
    phone: {
        type: String,
        required: [true, 'Customer phone is required']
    },
    email: {
        type: String,
        required: [true, 'Customer email is required'],
        unique: true
    },
    address: {
        type: String,
        required: [true, 'Customer address is required']
    }
}, {
    timestamps: true,
    collection: 'customers'
});

module.exports = mongoose.model('Customer', customerSchema);
