
const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getAttendanceReport,
  getPayrollReport,
  getDepartmentReport,
  getTurnoverReport
} = require('../controllers/reports.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/analytics', getDashboardAnalytics);
router.get('/attendance', roleMiddleware(['admin', 'hr']), getAttendanceReport);
router.get('/payroll', roleMiddleware(['admin', 'hr']), getPayrollReport);
router.get('/departments', roleMiddleware(['admin', 'hr']), getDepartmentReport);
router.get('/turnover', roleMiddleware(['admin', 'hr']), getTurnoverReport);

module.exports = router;