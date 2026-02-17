const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendanceByEmployee,
  getAttendanceSummary,
  createAttendance,
  getAllAttendance
} = require('../controllers/attendance.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/summary', getAttendanceSummary);
router.get('/employee/:employee_id', getAttendanceByEmployee);
router.get('/', getAllAttendance);
router.post('/', roleMiddleware(['admin', 'hr']), createAttendance);

module.exports = router;