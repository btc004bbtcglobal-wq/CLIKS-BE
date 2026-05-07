const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
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

router.post('/', employeeController.createEmployee);
router.post('/:id/documents', employeeController.uploadDocuments);
router.get('/', employeeController.getEmployees);
router.get('/activity', employeeController.getActivityLogs);
router.get('/performance', employeeController.getPerformanceReports);
router.get('/:id', employeeController.getEmployeeById);
router.post('/:id/role', employeeController.assignRole);

module.exports = router;
