const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);

module.exports = router;
