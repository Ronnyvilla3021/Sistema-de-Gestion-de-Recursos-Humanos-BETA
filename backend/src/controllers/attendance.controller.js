const pool = require('../config/database');

// Registrar entrada (check-in)
const checkIn = async (req, res) => {
  const { employee_id } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Verificar si ya tiene registro hoy
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [employee_id, today]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Ya has registrado entrada hoy' });
    }

    const checkInTime = new Date().toTimeString().split(' ')[0];

    const result = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, status) 
       VALUES ($1, $2, $3, 'present') 
       RETURNING *`,
      [employee_id, today, checkInTime]
    );

    res.json({
      message: 'Entrada registrada exitosamente',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar entrada' });
  }
};

// Registrar salida (check-out)
const checkOut = async (req, res) => {
  const { employee_id } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Buscar registro de hoy
    const attendance = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [employee_id, today]
    );

    if (attendance.rows.length === 0) {
      return res.status(400).json({ error: 'No hay registro de entrada hoy' });
    }

    if (attendance.rows[0].check_out) {
      return res.status(400).json({ error: 'Ya has registrado salida hoy' });
    }

    const checkOutTime = new Date().toTimeString().split(' ')[0];
    const checkInTime = attendance.rows[0].check_in;

    // Calcular horas trabajadas
    const checkIn = new Date(`2000-01-01 ${checkInTime}`);
    const checkOut = new Date(`2000-01-01 ${checkOutTime}`);
    const hoursWorked = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);

    // Determinar si es overtime (más de 8 horas)
    const isOvertime = parseFloat(hoursWorked) > 8;

    const result = await pool.query(
      `UPDATE attendance 
       SET check_out = $1, hours_worked = $2, is_overtime = $3 
       WHERE employee_id = $4 AND date = $5 
       RETURNING *`,
      [checkOutTime, hoursWorked, isOvertime, employee_id, today]
    );

    res.json({
      message: 'Salida registrada exitosamente',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar salida' });
  }
};

// Obtener asistencia por empleado
const getAttendanceByEmployee = async (req, res) => {
  const { employee_id } = req.params;
  const { month, year } = req.query;

  try {
    let query = `
      SELECT a.*, e.first_name, e.last_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.employee_id = $1
    `;
    const params = [employee_id];

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM a.date) = $2 AND EXTRACT(YEAR FROM a.date) = $3`;
      params.push(month, year);
    }

    query += ' ORDER BY a.date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
};

// Obtener resumen de asistencia
const getAttendanceSummary = async (req, res) => {
  const { month, year } = req.query;
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.first_name || ' ' || e.last_name as name,
        d.name as department,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as days_present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as days_absent,
        COALESCE(SUM(a.hours_worked), 0) as total_hours,
        COALESCE(SUM(CASE WHEN a.is_overtime THEN a.hours_worked - 8 ELSE 0 END), 0) as overtime_hours
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id 
        AND EXTRACT(MONTH FROM a.date) = $1 
        AND EXTRACT(YEAR FROM a.date) = $2
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
      GROUP BY e.id, e.first_name, e.last_name, d.name
      ORDER BY e.first_name
    `, [currentMonth, currentYear]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

// Registrar asistencia manual (para admin/hr)
const createAttendance = async (req, res) => {
  const { employee_id, date, check_in, check_out, status, notes } = req.body;

  try {
    let hoursWorked = null;
    let isOvertime = false;

    if (check_in && check_out) {
      const checkInDate = new Date(`2000-01-01 ${check_in}`);
      const checkOutDate = new Date(`2000-01-01 ${check_out}`);
      hoursWorked = ((checkOutDate - checkInDate) / (1000 * 60 * 60)).toFixed(2);
      isOvertime = parseFloat(hoursWorked) > 8;
    }

    const result = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, hours_worked, status, is_overtime, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [employee_id, date, check_in, check_out, hoursWorked, status, isOvertime, notes]
    );

    res.status(201).json({
      message: 'Asistencia registrada exitosamente',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear registro' });
  }
};

// Obtener todas las asistencias
const getAllAttendance = async (req, res) => {
  const { date } = req.query;

  try {
    let query = `
      SELECT 
        a.*,
        e.first_name || ' ' || e.last_name as employee_name,
        d.name as department_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
    `;

    const params = [];
    if (date) {
      query += ' WHERE a.date = $1';
      params.push(date);
    }

    query += ' ORDER BY a.date DESC, a.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceByEmployee,
  getAttendanceSummary,
  createAttendance,
  getAllAttendance
};