
const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getAllLeaveRequests,
  reviewLeaveRequest,
  getVacationBalance,
  getAllVacationBalances,
  getLeaveCalendar
} = require('../controllers/leave.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', createLeaveRequest);
router.get('/', getAllLeaveRequests);
router.put('/:id/review', roleMiddleware(['admin', 'hr']), reviewLeaveRequest);
router.get('/vacation-balance/:employee_id', getVacationBalance);
router.get('/vacation-balances', roleMiddleware(['admin', 'hr']), getAllVacationBalances);
router.get('/calendar', getLeaveCalendar);

module.exports = router;