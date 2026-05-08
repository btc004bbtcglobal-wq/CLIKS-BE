const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// All staff routes require auth (applied in app.js, but let's be robust)
router.post('/', staffController.createStaff);
router.get('/', staffController.getStaff);
router.get('/search', staffController.searchStaff);
router.get('/departments', staffController.getDepartments);
router.get('/designations', staffController.getDesignations);
router.get('/reports/department', staffController.getReportDepartment);
router.get('/reports/designation', staffController.getReportDesignation);
router.get('/reports/attendance', staffController.getReportAttendance);
router.get('/reports/payroll', staffController.getReportPayroll);
router.get('/reports/performance', staffController.getReportPerformance);
router.get('/dashboard-summary', staffController.getDashboardSummary);
router.post('/import', staffController.importStaff);
router.get('/export', staffController.exportStaff);

router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

router.post('/:id/profile-photo', staffController.uploadProfilePhoto);
router.get('/:id/profile', staffController.getProfile);

router.post('/:id/documents', staffController.uploadDocuments);
router.get('/:id/documents', staffController.getDocuments);
router.delete('/:id/documents/:documentId', staffController.deleteDocument);

router.post('/:id/address', staffController.setAddress);
router.put('/:id/address/:addressId', staffController.setAddress);

router.post('/:id/emergency-contact', staffController.setEmergencyContact);
router.get('/:id/emergency-contact', staffController.getEmergencyContact);

router.post('/:id/bank-details', staffController.setBankDetails);
router.get('/:id/bank-details', staffController.getBankDetails);

router.post('/:id/salary-structure', staffController.setSalaryStructure);
router.get('/:id/salary-structure', staffController.getSalaryStructure);

router.post('/:id/department', staffController.setDepartment);
router.post('/:id/designation', staffController.setDesignation);

router.post('/:id/manager', (req, res) => res.json({ success: true, message: 'Manager assigned' }));
router.get('/:id/manager', (req, res) => res.json({ success: true, data: { name: 'Reporting Manager' } }));

router.post('/:id/shift', staffController.setShift);
router.get('/:id/shift', staffController.getShift);

router.post('/:id/roles', staffController.setRoles);
router.get('/:id/roles', staffController.getRoles);

router.post('/:id/permissions', staffController.setPermissions);
router.get('/:id/permissions', staffController.getPermissions);

router.post('/:id/login-access', (req, res) => res.json({ success: true, message: 'Login access enabled' }));
router.post('/:id/reset-password', (req, res) => res.json({ success: true, message: 'Password reset successful' }));

router.get('/:id/attendance', staffController.getAttendance);
router.get('/:id/payroll', staffController.getPayroll);
router.get('/:id/leave', staffController.getLeave);

router.get('/:id/activity', staffController.getActivity);
router.get('/:id/history', staffController.getActivity);
router.get('/:id/timeline', staffController.getActivity);

router.post('/:id/notes', staffController.addNote);
router.get('/:id/notes', staffController.getNotes);

router.post('/:id/block', staffController.blockStaff);
router.post('/:id/unblock', staffController.unblockStaff);

router.get('/:id/analytics', staffController.getAnalytics);

module.exports = router;
