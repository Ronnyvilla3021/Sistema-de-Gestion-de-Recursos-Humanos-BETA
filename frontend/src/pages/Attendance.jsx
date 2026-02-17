import { useState, useEffect } from 'react';
import { attendanceService, employeeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('today'); // 'today', 'summary', 'history'
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [selectedDate, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      const empResponse = await employeeService.getAll();
      setEmployees(empResponse.data);

      if (view === 'today') {
        const attResponse = await attendanceService.getAll({ date: selectedDate });
        setAttendanceData(attResponse.data);
      } else if (view === 'summary') {
        const month = new Date(selectedDate).getMonth() + 1;
        const year = new Date(selectedDate).getFullYear();
        const summaryResponse = await attendanceService.getSummary({ month, year });
        setSummary(summaryResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (employeeId) => {
    try {
      await attendanceService.checkIn(employeeId);
      alert('Entrada registrada exitosamente');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al registrar entrada');
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      await attendanceService.checkOut(employeeId);
      alert('Salida registrada exitosamente');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al registrar salida');
    }
  };

  const getAttendanceStatus = (employeeId) => {
    return attendanceData.find(a => a.employee_id === employeeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Control de Asistencia</h1>
          <p className="text-gray-600 mt-1">Gestión de entrada y salida de empleados</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vista Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setView('today')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              view === 'today'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setView('summary')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              view === 'summary'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Resumen Mensual
          </button>
        </div>
      </div>

      {/* Vista de Hoy */}
      {view === 'today' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">
              Asistencia del {new Date(selectedDate).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Departamento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Salida</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Horas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.filter(e => e.status === 'active').map((employee) => {
                  const attendance = getAttendanceStatus(employee.id);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{employee.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.department_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {attendance?.check_in || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {attendance?.check_out || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {attendance?.hours_worked ? `${attendance.hours_worked}h` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {attendance ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            attendance.check_out 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {attendance.check_out ? '✓ Completo' : '→ En turno'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            Sin registro
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-2">
                        {!attendance && (
                          <button
                            onClick={() => handleCheckIn(employee.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Check-in
                          </button>
                        )}
                        {attendance && !attendance.check_out && (
                          <button
                            onClick={() => handleCheckOut(employee.id)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Check-out
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Resumen Mensual */}
      {view === 'summary' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">
              Resumen de {new Date(selectedDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Departamento</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Días Presente</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Días Ausente</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Total Horas</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Horas Extra</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.department}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {item.days_present || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                        {item.days_absent || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {parseFloat(item.total_hours || 0).toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                      {parseFloat(item.overtime_hours || 0).toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;