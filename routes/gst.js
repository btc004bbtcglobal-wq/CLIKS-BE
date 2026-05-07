const express = require('express');
const router = express.Router();
const gstController = require('../controllers/gstController');
const { auth } = require('../middleware/auth');

router.use(auth);

const businessOnly = (req, res, next) => {
    if (req.user && req.user.role === 'business') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Business account required.' });
    }
};

router.use(businessOnly);

router.post('/invoice', gstController.generateInvoice);
router.post('/eway-bill', gstController.generateEwayBill);
router.get('/summary', gstController.getSummary);
router.get('/returns', gstController.getReturns);

module.exports = router;
