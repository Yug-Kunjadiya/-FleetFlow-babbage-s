import { useEffect, useState } from 'react'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Download, TrendingUp, DollarSign, Award } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function Analytics() {
  const [vehicleAnalytics, setVehicleAnalytics] = useState([])
  const [topDrivers, setTopDrivers] = useState([])
  const [expenseBreakdown, setExpenseBreakdown] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [vehiclesRes, driversRes, expensesRes] = await Promise.all([
        api.get('/dashboard/vehicle-analytics'),
        api.get('/dashboard/top-drivers'),
        api.get('/dashboard/expense-breakdown')
      ])
      
      console.log('Analytics Data Received:', {
        vehicles: vehiclesRes.data,
        drivers: driversRes.data,
        expenses: expensesRes.data
      })
      
      setVehicleAnalytics(vehiclesRes.data.data || [])
      setTopDrivers(driversRes.data.data || [])
      setExpenseBreakdown(expensesRes.data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
      setLoading(false)
    }
  }

  const exportData = async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(`${filename} downloaded successfully`)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const expenseChartData = {
    labels: expenseBreakdown.map(e => e.category),
    datasets: [{
      label: 'Expenses',
      data: expenseBreakdown.map(e => e.amount),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    }]
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-500 mt-1">Financial insights and performance metrics</p>
        </div>
      </div>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => exportData('/export/vehicles/csv', 'vehicles.csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Vehicles (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => exportData('/export/trips/csv', 'trips.csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Trips (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => exportData('/export/drivers/csv', 'drivers.csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Drivers (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => exportData('/export/financial-report/pdf', 'financial-report.pdf')}
            >
              <Download className="w-4 h-4 mr-2" />
              Financial Report (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle ROI Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Vehicle ROI Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicleAnalytics.slice(0, 5).map((vehicle, idx) => (
                <div key={vehicle._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{vehicle.name}</p>
                      <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{vehicle.roi}%</p>
                    <p className="text-xs text-gray-500">ROI</p>
                  </div>
                </div>
              ))}
              {vehicleAnalytics.length === 0 && (
                <p className="text-gray-500 text-center py-4">No vehicle data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Drivers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Top Performing Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDrivers.map((driver, idx) => (
                <div key={driver._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{driver.name}</p>
                      <p className="text-sm text-gray-500">{driver.completedTrips} trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      driver.safetyScore >= 85 ? 'text-green-600' :
                      driver.safetyScore >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {driver.safetyScore}
                    </p>
                    <p className="text-xs text-gray-500">{driver.completionRate}% rate</p>
                  </div>
                </div>
              ))}
              {topDrivers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No driver data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Expense Breakdown by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="flex items-center justify-center">
              {expenseBreakdown.length > 0 ? (
                <div className="w-full max-w-md">
                  <Pie 
                    data={expenseChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-500">No expense data available</p>
              )}
            </div>

            {/* Breakdown List */}
            <div className="space-y-2">
              {expenseBreakdown.map((expense, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: expenseChartData.datasets[0].backgroundColor[idx] 
                      }}
                    />
                    <span className="font-medium">{expense.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-gray-500">{expense.count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(vehicleAnalytics.reduce((sum, v) => sum + (v.totalRevenue || 0), 0))}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(expenseBreakdown.reduce((sum, e) => sum + (e.amount || 0), 0))}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Net Profit</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(
                  vehicleAnalytics.reduce((sum, v) => sum + (v.totalRevenue || 0), 0) -
                  expenseBreakdown.reduce((sum, e) => sum + (e.amount || 0), 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
