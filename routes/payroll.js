const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// All endpoints inherit 'auth' and 'businessOnly' middleware from app.js
router.post('/', payrollController.createPayroll);
router.get('/', payrollController.getPayroll);
router.get('/search', payrollController.searchPayroll);
router.post('/process', payrollController.processPayroll);
router.post('/process-bulk', payrollController.processBulk);

router.get('/reports/salary', payrollController.getReportSalary);
router.get('/reports/pf', payrollController.getReportPF);
router.get('/reports/esi', payrollController.getReportESI);
router.get('/reports/tds', payrollController.getReportTDS);
router.get('/reports/overtime', payrollController.getReportOvertime);
router.get('/reports/department', payrollController.getReportDepartment);

router.post('/import', payrollController.importPayroll);
router.get('/export', payrollController.exportPayroll);

router.get('/dashboard-summary', payrollController.getDashboardSummary);

// ID-specific endpoints
router.get('/:id', payrollController.getPayrollById);
router.put('/:id', payrollController.updatePayroll);
router.delete('/:id', payrollController.deletePayroll);

router.post('/:id/earnings', payrollController.postEarnings);
router.get('/:id/earnings', payrollController.getEarnings);

router.post('/:id/deductions', payrollController.postDeductions);
router.get('/:id/deductions', payrollController.getDeductions);

router.post('/:id/bonus', payrollController.postBonus);
router.get('/:id/bonus', payrollController.getBonus);

router.post('/:id/overtime', payrollController.postOvertime);
router.get('/:id/overtime', payrollController.getOvertime);

router.post('/:id/reimbursement', payrollController.postReimbursement);
router.get('/:id/reimbursement', payrollController.getReimbursement);

router.post('/:id/loan', payrollController.postLoan);
router.get('/:id/loan', payrollController.getLoan);

router.post('/:id/advance-salary', payrollController.postAdvanceSalary);
router.get('/:id/advance-salary', payrollController.getAdvanceSalary);

router.post('/:id/pf', payrollController.postPF);
router.get('/:id/pf', payrollController.getPF);

router.post('/:id/esi', payrollController.postESI);
router.get('/:id/esi', payrollController.getESI);

router.post('/:id/tds', payrollController.postTDS);
router.get('/:id/tds', payrollController.getTDS);

router.post('/:id/payment', payrollController.postPayment);
router.get('/:id/payment-history', payrollController.getPaymentHistory);

router.post('/:id/payslip', payrollController.postPayslip);
router.get('/:id/payslip', payrollController.getPayslip);
router.get('/:id/payslip/pdf', payrollController.getPayslipPDF);

router.post('/:id/approve', payrollController.approvePayroll);
router.post('/:id/reject', payrollController.rejectPayroll);
router.post('/:id/lock', payrollController.lockPayroll);

router.get('/:id/history', payrollController.getHistory);
router.get('/:id/timeline', payrollController.getHistory);

router.post('/:id/notes', payrollController.addNote);
router.get('/:id/notes', payrollController.getNotes);

router.post('/:id/documents', payrollController.addDocuments);
router.get('/:id/documents', payrollController.getDocuments);

router.get('/:id/analytics', payrollController.getAnalytics);

module.exports = router;
