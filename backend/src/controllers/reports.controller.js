const pool = require('../config/database');

// Dashboard analytics completo
const getDashboardAnalytics = async (req, res) => {
  try {
    // KPIs básicos
    const totalEmployees = await pool.query(
      "SELECT COUNT(*) as count FROM employees WHERE status = 'active'"
    );

    const totalDepartments = await pool.query(
      'SELECT COUNT(*) as count FROM departments'
    );

    const avgSalary = await pool.query(
      "SELECT AVG(base_salary) as avg FROM employees WHERE status = 'active'"
    );

    // Distribución por departamento
    const employeesByDept = await pool.query(`
      SELECT d.name, COUNT(e.id) as count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      GROUP BY d.name
      ORDER BY count DESC
    `);

    // Tendencia de contrataciones (últimos 6 meses)
    const hiringTrend = await pool.query(`
      SELECT 
        TO_CHAR(hire_date, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM employees
      WHERE hire_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(hire_date, 'YYYY-MM')
      ORDER BY month
    `);

    // Distribución por género (si existe)
    const genderDistribution = await pool.query(`
      SELECT 
        COALESCE(gender, 'No especificado') as gender,
        COUNT(*) as count
      FROM employees
      WHERE status = 'active'
      GROUP BY gender
    `);

    // Empleados por rango de edad
    const ageDistribution = await pool.query(`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 25 THEN '<25'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 35 AND 44 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 45 AND 54 THEN '45-54'
          ELSE '55+'
        END as age_range,
        COUNT(*) as count
      FROM employees
      WHERE status = 'active' AND birth_date IS NOT NULL
      GROUP BY age_range
      ORDER BY age_range
    `);

    // Nómina total mensual
    const monthlyPayrollTotal = await pool.query(`
      SELECT COALESCE(SUM(base_salary), 0) as total
      FROM employees
      WHERE status = 'active'
    `);

    // Asistencia del mes actual
    const currentMonthAttendance = await pool.query(`
      SELECT 
        COUNT(DISTINCT employee_id) as employees_present,
        COALESCE(AVG(hours_worked), 0) as avg_hours
      FROM attendance
      WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND status = 'present'
    `);

    // Solicitudes de permiso pendientes
    const pendingLeaveRequests = await pool.query(
      "SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'"
    );

    res.json({
      kpis: {
        totalEmployees: parseInt(totalEmployees.rows[0].count),
        totalDepartments: parseInt(totalDepartments.rows[0].count),
        avgSalary: parseFloat(avgSalary.rows[0].avg || 0).toFixed(2),
        monthlyPayrollTotal: parseFloat(monthlyPayrollTotal.rows[0].total || 0).toFixed(2),
        avgHoursWorked: parseFloat(currentMonthAttendance.rows[0].avg_hours || 0).toFixed(2),
        pendingLeaveRequests: parseInt(pendingLeaveRequests.rows[0].count)
      },
      charts: {
        employeesByDepartment: employeesByDept.rows,
        hiringTrend: hiringTrend.rows,
        genderDistribution: genderDistribution.rows,
        ageDistribution: ageDistribution.rows
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener analytics' });
  }
};

// Reporte de asistencia
const getAttendanceReport = async (req, res) => {
  const { month, year, department_id } = req.query;
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  try {
    let query = `
      SELECT 
        e.id,
        e.first_name || ' ' || e.last_name as employee_name,
        e.identification,
        d.name as department_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as days_present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as days_absent,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as days_late,
        COALESCE(SUM(a.hours_worked), 0) as total_hours,
        COALESCE(SUM(CASE WHEN a.is_overtime THEN a.hours_worked - 8 ELSE 0 END), 0) as overtime_hours,
        COALESCE(AVG(a.hours_worked), 0) as avg_hours_per_day
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id 
        AND EXTRACT(MONTH FROM a.date) = $1
        AND EXTRACT(YEAR FROM a.date) = $2
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
    `;

    const params = [currentMonth, currentYear];

    if (department_id) {
      query += ' AND e.department_id = $3';
      params.push(department_id);
    }

    query += `
      GROUP BY e.id, e.first_name, e.last_name, e.identification, d.name
      ORDER BY e.first_name
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// Reporte de nómina
const getPayrollReport = async (req, res) => {
  const { month, year, department_id } = req.query;

  try {
    let query = `
      SELECT 
        p.id,
        e.first_name || ' ' || e.last_name as employee_name,
        e.identification,
        d.name as department_name,
        p.period_start,
        p.period_end,
        p.base_salary,
        p.overtime_hours,
        p.overtime_pay,
        p.tax_deduction,
        p.social_security_deduction,
        p.total_deductions,
        p.net_salary,
        p.payment_date,
        p.status
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM p.period_start) = $${paramCount} AND EXTRACT(YEAR FROM p.period_start) = $${paramCount + 1}`;
      params.push(month, year);
      paramCount += 2;
    }

    if (department_id) {
      query += ` AND e.department_id = $${paramCount}`;
      params.push(department_id);
      paramCount++;
    }

    query += ' ORDER BY e.first_name';

    const result = await pool.query(query, params);

    // Calcular totales
    const totals = result.rows.reduce((acc, row) => ({
      total_base_salary: acc.total_base_salary + parseFloat(row.base_salary),
      total_overtime_pay: acc.total_overtime_pay + parseFloat(row.overtime_pay || 0),
      total_deductions: acc.total_deductions + parseFloat(row.total_deductions || 0),
      total_net_salary: acc.total_net_salary + parseFloat(row.net_salary)
    }), {
      total_base_salary: 0,
      total_overtime_pay: 0,
      total_deductions: 0,
      total_net_salary: 0
    });

    res.json({
      data: result.rows,
      totals: totals,
      count: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// Reporte de departamentos
const getDepartmentReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id,
        d.name,
        d.description,
        COUNT(e.id) as employee_count,
        COALESCE(AVG(e.base_salary), 0) as avg_salary,
        COALESCE(SUM(e.base_salary), 0) as total_salary_cost
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      GROUP BY d.id, d.name, d.description
      ORDER BY employee_count DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// Reporte de rotación de personal
const getTurnoverReport = async (req, res) => {
  const { year } = req.query;
  const currentYear = year || new Date().getFullYear();

  try {
    const hired = await pool.query(`
      SELECT 
        TO_CHAR(hire_date, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM employees
      WHERE EXTRACT(YEAR FROM hire_date) = $1
      GROUP BY TO_CHAR(hire_date, 'YYYY-MM')
      ORDER BY month
    `, [currentYear]);

    const terminated = await pool.query(`
      SELECT 
        TO_CHAR(updated_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM employees
      WHERE status = 'inactive'
        AND EXTRACT(YEAR FROM updated_at) = $1
      GROUP BY TO_CHAR(updated_at, 'YYYY-MM')
      ORDER BY month
    `, [currentYear]);

    res.json({
      hired: hired.rows,
      terminated: terminated.rows,
      year: currentYear
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

module.exports = {
  getDashboardAnalytics,
  getAttendanceReport,
  getPayrollReport,
  getDepartmentReport,
  getTurnoverReport
};