const pool = require('../config/database');

// Función JavaScript para calcular días hábiles
const calculateBusinessDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No sábado ni domingo
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// Crear solicitud de permiso
const createLeaveRequest = async (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  try {
    // Calcular días solicitados usando JavaScript (no SQL)
    const days = calculateBusinessDays(start_date, end_date);

    // Si es vacación, verificar balance disponible
    if (leave_type === 'vacation') {
      const balance = await pool.query(
        'SELECT remaining_days FROM vacation_balance WHERE employee_id = $1 AND year = EXTRACT(YEAR FROM $2::DATE)',
        [employee_id, start_date]
      );

      if (balance.rows.length === 0 || balance.rows[0].remaining_days < days) {
        return res.status(400).json({ 
          error: 'Días de vacaciones insuficientes',
          available: balance.rows[0]?.remaining_days || 0,
          requested: days
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [employee_id, leave_type, start_date, end_date, days, reason]
    );

    res.status(201).json({
      message: 'Solicitud creada exitosamente',
      request: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
};

// Obtener todas las solicitudes
const getAllLeaveRequests = async (req, res) => {
  const { status, employee_id } = req.query;

  try {
    let query = `
      SELECT 
        lr.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.email as employee_email,
        d.name as department_name,
        reviewer.email as reviewed_by_email
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users reviewer ON lr.reviewed_by = reviewer.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND lr.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (employee_id) {
      query += ` AND lr.employee_id = $${paramCount}`;
      params.push(employee_id);
      paramCount++;
    }

    query += ' ORDER BY lr.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

// Aprobar o rechazar solicitud
const reviewLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { status, review_comments } = req.body;
  const reviewed_by = req.user.id;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const result = await pool.query(
      `UPDATE leave_requests 
       SET status = $1, 
           reviewed_by = $2, 
           reviewed_at = CURRENT_TIMESTAMP,
           review_comments = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, reviewed_by, review_comments, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json({
      message: `Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`,
      request: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al revisar solicitud' });
  }
};

// Obtener balance de vacaciones
const getVacationBalance = async (req, res) => {
  const { employee_id } = req.params;
  const year = req.query.year || new Date().getFullYear();

  try {
    let balance = await pool.query(
      'SELECT * FROM vacation_balance WHERE employee_id = $1 AND year = $2',
      [employee_id, year]
    );

    // Si no existe, crear uno
    if (balance.rows.length === 0) {
      balance = await pool.query(
        `INSERT INTO vacation_balance (employee_id, total_days, used_days, remaining_days, year)
         VALUES ($1, 15, 0, 15, $2)
         RETURNING *`,
        [employee_id, year]
      );
    }

    res.json(balance.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener balance' });
  }
};

// Obtener balances de todos los empleados
const getAllVacationBalances = async (req, res) => {
  const year = req.query.year || new Date().getFullYear();

  try {
    const result = await pool.query(`
      SELECT 
        vb.*,
        e.first_name || ' ' || e.last_name as employee_name,
        d.name as department_name
      FROM vacation_balance vb
      JOIN employees e ON vb.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE vb.year = $1 AND e.status = 'active'
      ORDER BY e.first_name
    `, [year]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener balances' });
  }
};

// Obtener calendario de ausencias
const getLeaveCalendar = async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        lr.id,
        lr.start_date,
        lr.end_date,
        lr.leave_type,
        lr.status,
        e.first_name || ' ' || e.last_name as employee_name,
        d.name as department_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE lr.status = 'approved'
        AND lr.start_date <= $2::DATE
        AND lr.end_date >= $1::DATE
      ORDER BY lr.start_date
    `, [start_date, end_date]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener calendario' });
  }
};

module.exports = {
  createLeaveRequest,
  getAllLeaveRequests,
  reviewLeaveRequest,
  getVacationBalance,
  getAllVacationBalances,
  getLeaveCalendar
};