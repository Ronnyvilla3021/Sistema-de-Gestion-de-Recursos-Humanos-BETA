const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats
} = require('../controllers/employee.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas públicas (para usuarios autenticados)
router.get('/', getAllEmployees);
router.get('/stats', getStats);
router.get('/:id', getEmployeeById);

// Rutas protegidas (solo admin y hr)
router.post('/', roleMiddleware(['admin', 'hr']), createEmployee);
router.put('/:id', roleMiddleware(['admin', 'hr']), updateEmployee);
router.delete('/:id', roleMiddleware(['admin']), deleteEmployee);

module.exports = router;