const express = require('express');
const router = Router = express.Router();
const payrollController = require('../controllers/payrollController');
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

router.post('/process', payrollController.processPayroll);
router.post('/payslip', payrollController.generatePayslip);
router.get('/reports', payrollController.getReports);
router.get('/employees/:id/payroll', payrollController.getEmployeePayrollHistory);

module.exports = router;
