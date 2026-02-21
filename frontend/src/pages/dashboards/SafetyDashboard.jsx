import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

/**
 * Safety Officer Dashboard - Safety and compliance focused
 * Shows driver safety scores, license alerts, maintenance warnings
 */
const SafetyDashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    suspendedDrivers: 0,
    licenseExpiry: 0,
    pendingMaintenance: 0
  });
  const [drivers, setDrivers] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch drivers
      const driversRes = await api.get('/drivers');
      const allDrivers = driversRes.data.data;
      
      // Fetch maintenance logs
      const maintenanceRes = await api.get('/maintenance-logs');
      const logs = maintenanceRes.data.data;
      
      // Calculate stats
      const suspendedDrivers = allDrivers.filter(d => d.status === 'Suspended').length;
      
      // Check license expiry (within 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const licenseExpiry = allDrivers.filter(d => {
        const expiryDate = new Date(d.licenseExpiry);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
      }).length;
      
      setStats({
        totalDrivers: allDrivers.length,
        suspendedDrivers,
        licenseExpiry,
        pendingMaintenance: logs.length
      });
      
      // Get drivers with safety concerns (low safety score or suspended)
      const concernDrivers = allDrivers
        .filter(d => d.safetyScore < 70 || d.status === 'Suspended')
        .sort((a, b) => a.safetyScore - b.safetyScore)
        .slice(0, 5);
      
      setDrivers(concernDrivers);
      setMaintenanceLogs(logs.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'On Leave': 'bg-blue-100 text-blue-800',
      'Suspended': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety Officer Dashboard</h1>
          <p className="text-gray-600 mt-1">Driver safety and compliance monitoring</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.totalDrivers}</h3>
              <p className="text-xs text-gray-500 mt-1">In fleet</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👨‍✈️</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended Drivers</p>
              <h3 className="text-4xl font-bold text-red-600 mt-2">{stats.suspendedDrivers}</h3>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">License Expiry</p>
              <h3 className="text-4xl font-bold text-yellow-600 mt-2">{stats.licenseExpiry}</h3>
              <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
            </div>
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Logs</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.pendingMaintenance}</h3>
              <p className="text-xs text-gray-500 mt-1">Total records</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔧</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Safety Alerts */}
      {(stats.suspendedDrivers > 0 || stats.licenseExpiry > 0) && (
        <Card className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Safety Alerts</h3>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                {stats.suspendedDrivers > 0 && (
                  <li>• {stats.suspendedDrivers} driver(s) currently suspended - review required</li>
                )}
                {stats.licenseExpiry > 0 && (
                  <li>• {stats.licenseExpiry} driver license(s) expiring within 30 days</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center h-20"
            onClick={() => window.location.href = '/drivers'}
          >
            <span className="mr-2 text-2xl">👨‍✈️</span>
            <span>Manage Drivers</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center h-20"
            onClick={() => window.location.href = '/maintenance'}
          >
            <span className="mr-2 text-2xl">🔧</span>
            <span>View Maintenance</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center h-20"
            onClick={() => window.location.href = '/vehicles'}
          >
            <span className="mr-2 text-2xl">🚛</span>
            <span>Inspect Vehicles</span>
          </Button>
        </div>
      </Card>

      {/* Drivers with Safety Concerns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Drivers Requiring Attention</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Safety Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Expiry</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    ✅ No drivers requiring immediate attention
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {driver.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.licenseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getSafetyScoreColor(driver.safetyScore)}`}>
                        {driver.safetyScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(driver.status)}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(driver.licenseExpiry).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Maintenance */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Maintenance Logs</h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/maintenance'}>
            View All →
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No maintenance logs found
                  </td>
                </tr>
              ) : (
                maintenanceLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.vehicle?.plateNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${log.cost?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.serviceDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SafetyDashboard;
