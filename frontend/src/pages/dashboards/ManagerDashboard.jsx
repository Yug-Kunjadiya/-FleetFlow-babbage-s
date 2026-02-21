import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

/**
 * Fleet Manager Dashboard - Full access to all metrics
 * Shows comprehensive fleet overview with financial and operational KPIs
 */
const ManagerDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [fuelTrend, setFuelTrend] = useState([]);
  const [revenueExpenses, setRevenueExpenses] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [topDrivers, setTopDrivers] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiRes, fuelRes, revenueRes, utilizationRes, driversRes, expenseRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/fuel-trend'),
        api.get('/dashboard/revenue-vs-expenses'),
        api.get('/dashboard/utilization-trend'),
        api.get('/dashboard/top-drivers'),
        api.get('/dashboard/expense-breakdown')
      ]);

      setKpis(kpiRes.data.data);
      setFuelTrend(fuelRes.data.data);
      setRevenueExpenses(revenueRes.data.data);
      setUtilization(utilizationRes.data.data);
      setTopDrivers(driversRes.data.data);
      setExpenseBreakdown(expenseRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fleet Manager Dashboard</h1>
        <p className="text-gray-600 mt-1">Complete fleet overview and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{kpis?.totalVehicles || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚛</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Trips</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{kpis?.activeTrips || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">${kpis?.totalRevenue?.toLocaleString() || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilization</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{kpis?.utilization || 0}%</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Utilization Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={utilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="utilization" stroke="#10b981" name="Utilization %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Consumption Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="consumption" stroke="#f59e0b" name="Liters" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Drivers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Drivers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trips Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Safety Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On-Time Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topDrivers.map((driver, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.tripsCompleted}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.safetyScore}/100</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.onTimeRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
