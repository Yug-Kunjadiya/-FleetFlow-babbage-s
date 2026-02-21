import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

/**
 * Dispatcher Dashboard - Operations focused
 * Shows active trips, available resources, and dispatch management
 */
const DispatcherDashboard = () => {
  const [stats, setStats] = useState({
    activeTrips: 0,
    availableVehicles: 0,
    availableDrivers: 0,
    pendingTrips: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch trips
      const tripsRes = await api.get('/trips');
      const trips = tripsRes.data.data;
      
      // Fetch vehicles
      const vehiclesRes = await api.get('/vehicles/available');
      const availableVehicles = vehiclesRes.data.data.length;
      
      // Fetch drivers
      const driversRes = await api.get('/drivers/available');
      const availableDrivers = driversRes.data.data.length;
      
      // Calculate stats
      const activeTrips = trips.filter(t => t.status === 'In Progress').length;
      const pendingTrips = trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length;
      
      setStats({
        activeTrips,
        availableVehicles,
        availableDrivers,
        pendingTrips
      });
      
      // Get recent trips (last 5)
      setRecentTrips(trips.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Dispatched': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Dispatcher Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time operations and dispatch management</p>
        </div>
        <Button onClick={() => window.location.href = '/trips'}>
          + Create New Trip
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Trips</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.activeTrips}</h3>
              <p className="text-xs text-gray-500 mt-1">Currently in progress</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🚚</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Vehicles</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.availableVehicles}</h3>
              <p className="text-xs text-gray-500 mt-1">Ready for dispatch</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🚛</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Drivers</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.availableDrivers}</h3>
              <p className="text-xs text-gray-500 mt-1">Ready to assign</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👨‍✈️</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Trips</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.pendingTrips}</h3>
              <p className="text-xs text-gray-500 mt-1">Awaiting dispatch</p>
            </div>
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⏳</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center h-20"
            onClick={() => window.location.href = '/trips'}
          >
            <span className="mr-2 text-2xl">➕</span>
            <span>Create Trip</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center h-20"
            onClick={() => window.location.href = '/vehicles'}
          >
            <span className="mr-2 text-2xl">🚛</span>
            <span>View Vehicles</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center h-20"
            onClick={() => window.location.href = '/drivers'}
          >
            <span className="mr-2 text-2xl">👨‍✈️</span>
            <span>View Drivers</span>
          </Button>
        </div>
      </Card>

      {/* Recent Trips */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trips</h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/trips'}>
            View All →
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTrips.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No trips found. Create your first trip to get started!
                  </td>
                </tr>
              ) : (
                recentTrips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.origin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.driver?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.vehicle?.plateNumber || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.distance} km
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

export default DispatcherDashboard;
