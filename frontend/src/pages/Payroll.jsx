import { useState, useEffect } from 'react';
import { payrollService, employeeService } from '../services/api';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateType, setGenerateType] = useState('single');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payrollRes, empRes] = await Promise.all([
        payrollService.getAll(),
        employeeService.getAll()
      ]);
      setPayrolls(payrollRes.data);
      setEmployees(empRes.data.filter(e => e.status === 'active'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      if (generateType === 'single') {
        if (!selectedEmployee) {
          alert('Selecciona un empleado');
          return;
        }
        await payrollService.generate({
          employee_id: parseInt(selectedEmployee),
          period_start: periodStart,
          period_end: periodEnd
        });
      } else {
        await payrollService.generateBatch({
          period_start: periodStart,
          period_end: periodEnd
        });
      }
      alert('Nómina generada exitosamente');
      setShowGenerateModal(false);
      setSelectedEmployee('');
      setPeriodStart('');
      setPeriodEnd('');
      loadData();
    } catch (error) {
      alert('Error al generar nómina: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('¿Aprobar esta nómina?')) {
      try {
        await payrollService.approve(id, { 
          payment_date: new Date().toISOString().split('T')[0] 
        });
        alert('Nómina aprobada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al aprobar:', error);
        alert('Error al aprobar nómina: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta nómina? Esta acción no se puede deshacer.')) {
      try {
        // Necesitamos agregar el endpoint delete en el backend
        // Por ahora simularemos con un mensaje
        await payrollService.delete(id);
        alert('Nómina eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar nómina');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-pulse text-xl text-gray-600">Cargando...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Nómina</h1>
          <p className="text-gray-600 mt-1">Control de pagos y salarios</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Generar Nómina</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Nóminas</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{payrolls.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pendientes</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-2">
                {payrolls.filter(p => p.status === 'pending').length}
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
              <p className="text-gray-500 text-sm">Total Pagado</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">
                ${payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Nóminas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Período</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Salario Base</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Horas Extra</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Deducciones</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Neto</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.map((payroll) => (
                <tr key={payroll.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{payroll.employee_name}</div>
                    <div className="text-xs text-gray-500">{payroll.department_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payroll.period_start).toLocaleDateString()} - {new Date(payroll.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    ${parseFloat(payroll.base_salary).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-blue-600">
                    +${parseFloat(payroll.overtime_pay || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-red-600">
                    -${parseFloat(payroll.total_deductions || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                    ${parseFloat(payroll.net_salary).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      payroll.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {payroll.status === 'approved' ? '✓ Aprobado' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    {payroll.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(payroll.id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleDelete(payroll.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                    {payroll.status === 'approved' && (
                      <button
                        onClick={() => handleDelete(payroll.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Generar Nómina */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Generar Nómina</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={generateType}
                  onChange={(e) => setGenerateType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">Individual</option>
                  <option value="batch">Todos los empleados</option>
                </select>
              </div>

              {generateType === 'single' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedEmployee('');
                  setPeriodStart('');
                  setPeriodEnd('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={!periodStart || !periodEnd || (generateType === 'single' && !selectedEmployee)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;