const express = require('express');
const router = express.Router();
const {
  generatePayroll,
  generateBatchPayroll,
  getAllPayrolls,
  getPayrollByEmployee,
  approvePayroll,
  getPayrollSettings,
  updatePayrollSettings,
  deletePayroll  // ← AGREGAR
} = require('../controllers/payroll.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/settings', roleMiddleware(['admin', 'hr']), getPayrollSettings);
router.put('/settings', roleMiddleware(['admin']), updatePayrollSettings);
router.post('/generate', roleMiddleware(['admin', 'hr']), generatePayroll);
router.post('/generate-batch', roleMiddleware(['admin', 'hr']), generateBatchPayroll);
router.get('/', roleMiddleware(['admin', 'hr']), getAllPayrolls);
router.get('/employee/:employee_id', getPayrollByEmployee);
router.put('/:id/approve', roleMiddleware(['admin', 'hr']), approvePayroll);
router.delete('/:id', roleMiddleware(['admin', 'hr']), deletePayroll);  // ← AGREGAR ESTA LÍNEA

module.exports = router;