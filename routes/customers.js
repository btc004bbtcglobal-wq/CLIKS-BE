const express = require('express');
const router = express.Router();
const customerCrmController = require('../controllers/customerCrmController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Business role check middleware
const businessOnly = (req, res, next) => {
    if (req.user && req.user.role === 'business') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Business account required.' });
    }
};

router.use(businessOnly);

// Static/Reports paths (MUST be declared BEFORE parameter routes like /:id)
router.get('/outstanding/list', customerCrmController.getOutstandingList);
router.get('/reports/top-customers', customerCrmController.getTopCustomersReport);
router.get('/reports/sales', customerCrmController.getSalesReport);
router.get('/reports/balance', customerCrmController.getBalanceReport);
router.post('/import', customerCrmController.importCustomers);
router.get('/export', customerCrmController.exportCustomers);
router.get('/search', customerCrmController.searchCustomers);

// Base Customer CRUD
router.post('/', customerCrmController.createCustomer);
router.get('/', customerCrmController.getCustomers);
router.get('/:id', customerCrmController.getCustomerById);
router.put('/:id', customerCrmController.updateCustomer);
router.delete('/:id', customerCrmController.deleteCustomer);

// Financial / Activity nested paths
router.get('/:id/ledger', customerCrmController.getLedger);
router.get('/:id/outstanding', customerCrmController.getOutstanding);
router.get('/:id/invoices', customerCrmController.getInvoices);
router.get('/:id/orders', customerCrmController.getOrders);
router.get('/:id/returns', customerCrmController.getReturns);

router.post('/:id/payments', customerCrmController.createPayment);
router.get('/:id/payments', customerCrmController.getPayments);

router.post('/:id/address', customerCrmController.createAddress);
router.put('/:id/address/:addressId', customerCrmController.updateAddress);

router.post('/:id/notes', customerCrmController.createNote);
router.get('/:id/notes', customerCrmController.getNotes);

router.post('/:id/documents', customerCrmController.createDocument);
router.get('/:id/analytics', customerCrmController.getAnalytics);

module.exports = router;
