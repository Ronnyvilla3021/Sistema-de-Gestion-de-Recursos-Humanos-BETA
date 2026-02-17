const pool = require('../config/database');

// Obtener todos los empleados
const getAllEmployees = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Obtener un empleado por ID
const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Crear empleado
const createEmployee = async (req, res) => {
  const {
    first_name,
    last_name,
    identification,
    email,
    phone,
    position,
    department_id,
    base_salary,
    hire_date
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO employees 
       (first_name, last_name, identification, email, phone, position, department_id, base_salary, hire_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [first_name, last_name, identification, email, phone, position, department_id, base_salary, hire_date]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employee: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Identification or email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

// Actualizar empleado
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    identification,
    email,
    phone,
    position,
    department_id,
    base_salary,
    status
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees 
       SET first_name = $1, last_name = $2, identification = $3, email = $4, 
           phone = $5, position = $6, department_id = $7, base_salary = $8, 
           status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 
       RETURNING *`,
      [first_name, last_name, identification, email, phone, position, department_id, base_salary, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Eliminar empleado
const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Estadísticas del dashboard
const getStats = async (req, res) => {
  try {
    const totalEmployees = await pool.query('SELECT COUNT(*) FROM employees WHERE status = $1', ['active']);
    const totalDepartments = await pool.query('SELECT COUNT(*) FROM departments');
    const avgSalary = await pool.query('SELECT AVG(base_salary) FROM employees WHERE status = $1', ['active']);
    const employeesByDept = await pool.query(`
      SELECT d.name, COUNT(e.id) as count 
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      GROUP BY d.name
    `);

    res.json({
      totalEmployees: parseInt(totalEmployees.rows[0].count),
      totalDepartments: parseInt(totalDepartments.rows[0].count),
      avgSalary: parseFloat(avgSalary.rows[0].avg || 0).toFixed(2),
      employeesByDepartment: employeesByDept.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats
};