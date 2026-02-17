import { useState, useEffect } from 'react';
import { reportsService, employeeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await reportsService.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback a stats básicos
      try {
        const statsResponse = await employeeService.getStats();
        setAnalytics({
          kpis: {
            totalEmployees: statsResponse.data.totalEmployees || 0,
            totalDepartments: statsResponse.data.totalDepartments || 0,
            avgSalary: statsResponse.data.avgSalary || 0,
            monthlyPayrollTotal: 0,
            avgHoursWorked: 0,
            pendingLeaveRequests: 0
          },
          charts: {
            employeesByDepartment: statsResponse.data.employeesByDepartment || [],
            hiringTrend: [],
            genderDistribution: [],
            ageDistribution: []
          }
        });
      } catch (err) {
        console.error('Error loading fallback stats:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const charts = analytics?.charts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Analytics</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {user?.email}</p>
      </div>

      {/* KPI Cards - Primera fila */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Empleados */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Empleados</p>
              <h3 className="text-4xl font-bold mt-2">{kpis.totalEmployees || 0}</h3>
              <p className="text-blue-100 text-xs mt-2">Empleados activos</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Departamentos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Departamentos</p>
              <h3 className="text-4xl font-bold mt-2">{kpis.totalDepartments || 0}</h3>
              <p className="text-green-100 text-xs mt-2">Áreas activas</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Salario Promedio */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Salario Promedio</p>
              <h3 className="text-4xl font-bold mt-2">${parseFloat(kpis.avgSalary || 0).toFixed(0)}</h3>
              <p className="text-purple-100 text-xs mt-2">Por empleado/mes</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Segunda fila */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nómina Total */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Nómina Mensual</p>
              <h3 className="text-3xl font-bold mt-2">${parseFloat(kpis.monthlyPayrollTotal || 0).toLocaleString()}</h3>
              <p className="text-orange-100 text-xs mt-2">Total mensual</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Horas Promedio */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Promedio Horas</p>
              <h3 className="text-4xl font-bold mt-2">{parseFloat(kpis.avgHoursWorked || 0).toFixed(1)}</h3>
              <p className="text-pink-100 text-xs mt-2">Horas/día este mes</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Permisos Pendientes */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Permisos Pendientes</p>
              <h3 className="text-4xl font-bold mt-2">{kpis.pendingLeaveRequests || 0}</h3>
              <p className="text-indigo-100 text-xs mt-2">Requieren aprobación</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Departamento */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Empleados por Departamento</h2>
          <div className="space-y-4">
            {charts.employeesByDepartment?.map((dept, index) => {
              const total = charts.employeesByDepartment.reduce((sum, d) => sum + parseInt(d.count), 0);
              const percentage = total > 0 ? (dept.count / total) * 100 : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{dept.count}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tendencia de Contrataciones */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contrataciones Recientes</h2>
          {charts.hiringTrend && charts.hiringTrend.length > 0 ? (
            <div className="space-y-3">
              {charts.hiringTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{item.month}</span>
                  <span className="text-lg font-bold text-blue-600">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay datos de contrataciones recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen Rápido */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Resumen del Sistema</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-blue-100 text-sm">Empleados</p>
            <p className="text-3xl font-bold">{kpis.totalEmployees || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm">Departamentos</p>
            <p className="text-3xl font-bold">{kpis.totalDepartments || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm">Nómina Total</p>
            <p className="text-3xl font-bold">${parseFloat(kpis.monthlyPayrollTotal || 0).toFixed(0)}K</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm">Pendientes</p>
            <p className="text-3xl font-bold">{kpis.pendingLeaveRequests || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;