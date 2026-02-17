const pool = require('../config/database');

// Generar nómina para un empleado
const generatePayroll = async (req, res) => {
  const { employee_id, period_start, period_end } = req.body;
  const generatedBy = req.user.id;

  try {
    // Obtener datos del empleado
    const employeeResult = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [employee_id]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const employee = employeeResult.rows[0];
    const baseSalary = parseFloat(employee.base_salary);

    // Calcular horas extras del período
    const attendanceResult = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN hours_worked > 8 THEN hours_worked - 8 ELSE 0 END), 0) as overtime_hours
       FROM attendance
       WHERE employee_id = $1 
         AND date >= $2 
         AND date <= $3
         AND status = 'present'`,
      [employee_id, period_start, period_end]
    );

    const overtimeHours = parseFloat(attendanceResult.rows[0].overtime_hours) || 0;

    // Obtener configuración de nómina
    const settingsResult = await pool.query('SELECT * FROM payroll_settings LIMIT 1');
    const settings = settingsResult.rows[0];

    // Cálculos
    const hourlyRate = baseSalary / 160; // asumiendo 160 horas mensuales
    const overtimePay = overtimeHours * hourlyRate * parseFloat(settings.overtime_multiplier);
    
    const grossSalary = baseSalary + overtimePay;
    
    const taxDeduction = grossSalary * (parseFloat(settings.tax_percentage) / 100);
    const socialSecurityDeduction = grossSalary * (parseFloat(settings.social_security_percentage) / 100);
    const totalDeductions = taxDeduction + socialSecurityDeduction;
    
    const netSalary = grossSalary - totalDeductions;

    // Insertar nómina
    const result = await pool.query(
      `INSERT INTO payroll (
        employee_id, period_start, period_end, base_salary, 
        overtime_hours, overtime_pay, tax_deduction, 
        social_security_deduction, deductions, total_deductions,
        net_salary, generated_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *`,
      [
        employee_id, period_start, period_end, baseSalary,
        overtimeHours, overtimePay, taxDeduction,
        socialSecurityDeduction, 0, totalDeductions,
        netSalary, generatedBy
      ]
    );

    res.status(201).json({
      message: 'Nómina generada exitosamente',
      payroll: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar nómina' });
  }
};

// Generar nómina para todos los empleados activos
const generateBatchPayroll = async (req, res) => {
  const { period_start, period_end } = req.body;
  const generatedBy = req.user.id;

  try {
    const employees = await pool.query(
      'SELECT * FROM employees WHERE status = $1',
      ['active']
    );

    const settings = await pool.query('SELECT * FROM payroll_settings LIMIT 1');
    const config = settings.rows[0];

    const payrollResults = [];

    for (const employee of employees.rows) {
      const baseSalary = parseFloat(employee.base_salary);

      // Calcular horas extras
      const attendanceResult = await pool.query(
        `SELECT 
           COALESCE(SUM(CASE WHEN hours_worked > 8 THEN hours_worked - 8 ELSE 0 END), 0) as overtime_hours
         FROM attendance
         WHERE employee_id = $1 
           AND date >= $2 
           AND date <= $3
           AND status = 'present'`,
        [employee.id, period_start, period_end]
      );

      const overtimeHours = parseFloat(attendanceResult.rows[0].overtime_hours) || 0;

      // Cálculos
      const hourlyRate = baseSalary / 160;
      const overtimePay = overtimeHours * hourlyRate * parseFloat(config.overtime_multiplier);
      const grossSalary = baseSalary + overtimePay;
      
      const taxDeduction = grossSalary * (parseFloat(config.tax_percentage) / 100);
      const socialSecurityDeduction = grossSalary * (parseFloat(config.social_security_percentage) / 100);
      const totalDeductions = taxDeduction + socialSecurityDeduction;
      
      const netSalary = grossSalary - totalDeductions;

      // Insertar nómina
      const result = await pool.query(
        `INSERT INTO payroll (
          employee_id, period_start, period_end, base_salary, 
          overtime_hours, overtime_pay, tax_deduction, 
          social_security_deduction, total_deductions,
          net_salary, generated_by, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING *`,
        [
          employee.id, period_start, period_end, baseSalary,
          overtimeHours, overtimePay, taxDeduction,
          socialSecurityDeduction, totalDeductions,
          netSalary, generatedBy
        ]
      );

      payrollResults.push(result.rows[0]);
    }

    res.status(201).json({
      message: `Nómina generada para ${payrollResults.length} empleados`,
      count: payrollResults.length,
      payrolls: payrollResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar nómina masiva' });
  }
};

// Obtener todas las nóminas
const getAllPayrolls = async (req, res) => {
  const { status, month, year } = req.query;

  try {
    let query = `
      SELECT 
        p.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.identification,
        d.name as department_name,
        u.email as generated_by_email
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON p.generated_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM p.period_start) = $${paramCount} AND EXTRACT(YEAR FROM p.period_start) = $${paramCount + 1}`;
      params.push(month, year);
      paramCount += 2;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener nóminas' });
  }
};

// Obtener nómina por empleado
const getPayrollByEmployee = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, e.first_name || ' ' || e.last_name as employee_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.employee_id = $1
       ORDER BY p.period_start DESC`,
      [employee_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener nóminas' });
  }
};

// Aprobar nómina
const approvePayroll = async (req, res) => {
  const { id } = req.params;
  const { payment_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE payroll 
       SET status = 'approved', payment_date = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [payment_date || new Date(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nómina no encontrada' });
    }

    res.json({
      message: 'Nómina aprobada exitosamente',
      payroll: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aprobar nómina' });
  }
};

// Obtener configuración de nómina
const getPayrollSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payroll_settings LIMIT 1');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

// Actualizar configuración de nómina
const updatePayrollSettings = async (req, res) => {
  const { tax_percentage, social_security_percentage, overtime_multiplier } = req.body;

  try {
    const result = await pool.query(
      `UPDATE payroll_settings 
       SET tax_percentage = $1, 
           social_security_percentage = $2, 
           overtime_multiplier = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1
       RETURNING *`,
      [tax_percentage, social_security_percentage, overtime_multiplier]
    );

    res.json({
      message: 'Configuración actualizada exitosamente',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

module.exports = {
  generatePayroll,
  generateBatchPayroll,
  getAllPayrolls,
  getPayrollByEmployee,
  approvePayroll,
  getPayrollSettings,
  updatePayrollSettings
};