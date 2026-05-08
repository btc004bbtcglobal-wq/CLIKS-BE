const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// All endpoints automatically inherit 'auth' and 'businessOnly' middleware from app.js
router.post('/', attendanceController.createAttendance);
router.get('/', attendanceController.getAttendance);
router.get('/search', attendanceController.searchAttendance);
router.post('/manual-entry', attendanceController.manualEntry);
router.post('/regularization', attendanceController.regularization);

router.get('/late-comers', attendanceController.getLateComers);
router.get('/absent-list', attendanceController.getAbsentList);
router.get('/overtime-list', attendanceController.getOvertimeList);

router.post('/holiday', attendanceController.createHoliday);
router.get('/holidays', attendanceController.getHolidays);

router.post('/weekoff', attendanceController.createWeekoff);
router.get('/weekoffs', attendanceController.getWeekoffs);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);

router.get('/shifts', attendanceController.getShifts);

router.get('/reports/daily', attendanceController.getReportDaily);
router.get('/reports/monthly', attendanceController.getReportMonthly);
router.get('/reports/employee', attendanceController.getReportEmployee);
router.get('/reports/shift', attendanceController.getReportShift);
router.get('/reports/overtime', attendanceController.getReportOvertime);
router.get('/reports/late-coming', attendanceController.getReportLateComing);

router.get('/dashboard-summary', attendanceController.getDashboardSummary);

// ID-specific endpoints
router.get('/:id', attendanceController.getAttendanceById);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

router.post('/:id/approve', attendanceController.approveRegularization);
router.post('/:id/reject', attendanceController.rejectRegularization);

router.post('/:id/break-start', attendanceController.breakStart);
router.post('/:id/break-end', attendanceController.breakEnd);

router.post('/:id/overtime', attendanceController.postOvertime);
router.get('/:id/overtime', attendanceController.getOvertime);

router.post('/:id/shift', attendanceController.setShift);

router.post('/:id/location', attendanceController.setLocation);
router.get('/:id/location', attendanceController.getLocation);

router.post('/:id/biometric', attendanceController.setBiometric);
router.get('/:id/biometric', attendanceController.getBiometric);

router.get('/:id/history', attendanceController.getHistory);
router.get('/:id/timeline', attendanceController.getHistory);

router.get('/:id/summary', attendanceController.getSummary);
router.get('/:id/monthly-summary', attendanceController.getMonthlySummary);

router.post('/:id/notes', attendanceController.addNote);
router.get('/:id/notes', attendanceController.getNotes);

router.get('/:id/analytics', attendanceController.getAnalytics);

module.exports = router;
