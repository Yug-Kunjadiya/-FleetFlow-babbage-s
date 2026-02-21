import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Truck, AlertTriangle, Activity, Package, TrendingUp, DollarSign, Users, Shield, MapPin } from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { toast } from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { formatCurrency } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [fuelTrend, setFuelTrend] = useState([])
  const [revenueVsExpenses, setRevenueVsExpenses] = useState([])
  const [vehicleAnalytics, setVehicleAnalytics] = useState([])
  const [topDrivers, setTopDrivers] = useState([])
  const [expenseBreakdown, setExpenseBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const { on } = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
    
    // Real-time updates
    const cleanup1 = on('vehicle-updated', fetchDashboardData)
    const cleanup2 = on('trip-completed', fetchDashboardData)
    const cleanup3 = on('fuel-logged', fetchDashboardData)
    const cleanup4 = on('maintenance-logged', fetchDashboardData)
    
    return () => {
      cleanup1?.()
      cleanup2?.()
      cleanup3?.()
      cleanup4?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [kpisRes, fuelRes, revenueRes, vehiclesRes, driversRes, expensesRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/fuel-trend?period=30'),
        api.get('/dashboard/revenue-vs-expenses?period=6'),
        api.get('/dashboard/vehicle-analytics'),
        api.get('/dashboard/top-drivers'),
        api.get('/dashboard/expense-breakdown')
      ])

      console.log('Dashboard Data Received:', {
        kpis: kpisRes.data,
        fuel: fuelRes.data,
        revenue: revenueRes.data,
        vehicles: vehiclesRes.data,
        drivers: driversRes.data,
        expenses: expensesRes.data
      })

      setKpis(kpisRes.data.data || {})
      setFuelTrend(fuelRes.data.data || [])
      setRevenueVsExpenses(revenueRes.data.data || [])
      setVehicleAnalytics(vehiclesRes.data.data || [])
      setTopDrivers(driversRes.data.data || [])
      setExpenseBreakdown(expensesRes.data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Role-based KPI cards
  const getRoleBasedKPIs = () => {
    const allKPIs = [
      {
        title: 'Active Fleet',
        value: kpis?.activeFleet || 0,
        subtitle: 'Vehicles on trip',
        icon: Truck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        roles: ['Fleet Manager', 'Dispatcher']
      },
      {
        title: 'Total Vehicles',
        value: kpis?.totalVehicles || 0,
        subtitle: 'Fleet size',
        icon: Truck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        roles: ['Fleet Manager']
      },
      {
        title: 'Active Drivers',
        value: kpis?.activeDrivers || 0,
        subtitle: 'Drivers on duty',
        icon: Users,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer']
      },
      {
        title: 'Maintenance Alerts',
        value: kpis?.maintenanceAlerts || 0,
        subtitle: 'Vehicles in shop',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        roles: ['Fleet Manager', 'Safety Officer']
      },
      {
        title: 'Safety Score',
        value: `${kpis?.averageSafetyScore || 0}%`,
        subtitle: 'Fleet average',
        icon: Shield,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        roles: ['Safety Officer', 'Fleet Manager']
      },
      {
        title: 'Pending Trips',
        value: kpis?.pendingCargo || 0,
        subtitle: 'Draft trips',
        icon: MapPin,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        roles: ['Dispatcher', 'Fleet Manager']
      },
      {
        title: 'Utilization Rate',
        value: `${kpis?.utilizationRate || 0}%`,
        subtitle: 'Fleet efficiency',
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        roles: ['Fleet Manager', 'Financial Analyst']
      },
      {
        title: 'Monthly Revenue',
        value: formatCurrency(kpis?.monthlyRevenue || 0),
        subtitle: 'This month',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        roles: ['Fleet Manager', 'Financial Analyst']
      },
      {
        title: 'Total Expenses',
        value: formatCurrency(kpis?.monthlyExpenses || 0),
        subtitle: 'This month',
        icon: TrendingUp,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        roles: ['Financial Analyst', 'Fleet Manager']
      },
      {
        title: 'Profit Margin',
        value: `${kpis?.profitMargin || 0}%`,
        subtitle: 'This month',
        icon: TrendingUp,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        roles: ['Financial Analyst', 'Fleet Manager']
      }
    ]

    // Filter KPIs based on user role
    const filteredKPIs = allKPIs.filter(kpi => kpi.roles.includes(user?.role))
    
    // Return first 5 KPIs for the role
    return filteredKPIs.slice(0, 5)
  }

  const kpiCards = getRoleBasedKPIs()

  const fuelChartData = {
    labels: fuelTrend.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Fuel Cost ($)',
        data: fuelTrend.map(item => item.cost),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  }

  const revenueChartData = {
    labels: revenueVsExpenses.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: revenueVsExpenses.map(item => item.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
      {
        label: 'Expenses',
        data: revenueVsExpenses.map(item => item.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  // Get role-based badge color
  const getRoleBadgeColor = () => {
    switch(user?.role) {
      case 'Fleet Manager': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Dispatcher': return 'bg-green-100 text-green-800 border-green-300'
      case 'Safety Officer': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Financial Analyst': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get role-specific welcome message
  const getRoleMessage = () => {
    switch(user?.role) {
      case 'Fleet Manager': return 'Comprehensive overview of your entire fleet operations'
      case 'Dispatcher': return 'Monitor active trips and driver availability'
      case 'Safety Officer': return 'Track safety metrics and maintenance alerts'
      case 'Financial Analyst': return 'Analyze revenue, expenses, and profitability'
      default: return 'Real-time fleet overview and analytics'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-900">Command Center</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeColor()}`}>
              {user?.role || 'User'}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{getRoleMessage()}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{kpi.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
                  </div>
                  <div className={`${kpi.bgColor} p-3 rounded-full shadow-sm`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Cost Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Line data={fuelChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Bar data={revenueChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Trips</p>
              <p className="text-2xl font-bold">{kpis?.activeTrips || 0}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed (Month)</p>
              <p className="text-2xl font-bold">{kpis?.completedTripsThisMonth || 0}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Available Drivers</p>
              <p className="text-2xl font-bold">{kpis?.availableDrivers || 0}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold">{kpis?.totalVehicles || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section - Vehicle ROI & Top Drivers */}
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
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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
              <Users className="w-5 h-5 mr-2" />
              Top Performing Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDrivers.map((driver, idx) => (
                <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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

      {/* Expense Breakdown - Show for relevant roles */}
      {['Fleet Manager', 'Financial Analyst'].includes(user?.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Expense Breakdown by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenseBreakdown.map((expense, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.6)',
                          'rgba(54, 162, 235, 0.6)',
                          'rgba(255, 206, 86, 0.6)',
                          'rgba(75, 192, 192, 0.6)',
                          'rgba(153, 102, 255, 0.6)',
                          'rgba(255, 159, 64, 0.6)',
                        ][idx % 6]
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
              {expenseBreakdown.length === 0 && (
                <p className="text-gray-500 text-center py-4">No expense data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
