import { useState, useEffect } from 'react';
import { leaveService, employeeService } from '../services/api';

const Leave = () => {
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('requests');
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'vacation',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, empRes] = await Promise.all([
        leaveService.getAll(),
        employeeService.getAll()
      ]);
      setRequests(reqRes.data);
      setEmployees(empRes.data.filter(e => e.status === 'active'));

      if (view === 'balances') {
        const balRes = await leaveService.getAllBalances();
        setBalances(balRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBusinessDays = (start, end) => {
    let count = 0;
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No sábado ni domingo
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.start_date || !formData.end_date) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const days = calculateBusinessDays(formData.start_date, formData.end_date);

      await leaveService.create({
        employee_id: parseInt(formData.employee_id),
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days_requested: days,
        reason: formData.reason
      });

      alert('Solicitud creada exitosamente');
      setShowModal(false);
      setFormData({ employee_id: '', leave_type: 'vacation', start_date: '', end_date: '', reason: '' });
      loadData();
    } catch (error) {
      console.error('Error creating leave:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReview = async (id, status) => {
    const comments = prompt(`¿Comentarios para ${status === 'approved' ? 'aprobar' : 'rechazar'}?`);
    try {
      await leaveService.review(id, { status, review_comments: comments || '' });
      alert(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
      loadData();
    } catch (error) {
      alert('Error al procesar');
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-purple-100 text-purple-800',
      maternity: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      vacation: 'Vacaciones',
      sick: 'Enfermedad',
      personal: 'Personal',
      maternity: 'Maternidad'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-pulse text-xl text-gray-600">Cargando...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Permisos y Vacaciones</h1>
          <p className="text-gray-600 mt-1">Gestión de ausencias</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setView('requests')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              view === 'requests' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            Solicitudes
          </button>
          <button
            onClick={() => setView('balances')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              view === 'balances' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            Balance de Vacaciones
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pendientes</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-2">
                {requests.filter(r => r.status === 'pending').length}
              </h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Aprobadas</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {requests.filter(r => r.status === 'approved').length}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rechazadas</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">
                {requests.filter(r => r.status === 'rejected').length}
              </h3>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Vista de Solicitudes */}
      {view === 'requests' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fechas</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Días</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Razón</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{req.employee_name}</div>
                      <div className="text-xs text-gray-500">{req.department_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLeaveTypeColor(req.leave_type)}`}>
                        {getLeaveTypeLabel(req.leave_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {req.days_requested}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {req.reason || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {req.status === 'approved' ? '✓ Aprobado' :
                         req.status === 'rejected' ? '✗ Rechazado' :
                         '⏳ Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReview(req.id, 'approved')}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReview(req.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Balances */}
      {view === 'balances' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Total Días</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Usados</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Restantes</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Progreso</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {balances.map((bal) => (
                  <tr key={bal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{bal.employee_name}</div>
                      <div className="text-xs text-gray-500">{bal.department_name}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{bal.total_days}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-red-600">{bal.used_days}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">{bal.remaining_days}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(bal.used_days / bal.total_days) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nueva Solicitud - CORREGIDO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nueva Solicitud</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empleado *</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar empleado...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Permiso *</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="vacation">Vacaciones</option>
                  <option value="sick">Enfermedad</option>
                  <option value="personal">Personal</option>
                  <option value="maternity">Maternidad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Razón</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Opcional"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ employee_id: '', leave_type: 'vacation', start_date: '', end_date: '', reason: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;