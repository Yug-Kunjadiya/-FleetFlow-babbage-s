import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Plus, AlertTriangle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function FuelLogs() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission('fuelLogs', 'create')
  const [fuelLogs, setFuelLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vehicle: '',
    litersFilled: '',
    costPerLiter: '',
    fuelStation: '',
    odometer: ''
  })

  useEffect(() => {
    fetchFuelLogs()
    fetchVehicles()
  }, [])

  const fetchFuelLogs = async () => {
    try {
      const response = await api.get('/fuel-logs')
      setFuelLogs(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching fuel logs:', error)
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles')
      setVehicles(response.data.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/fuel-logs', formData)
      toast.success('Fuel log created successfully')
      setShowForm(false)
      resetForm()
      fetchFuelLogs()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const resetForm = () => {
    setFormData({
      vehicle: '',
      litersFilled: '',
      costPerLiter: '',
      fuelStation: '',
      odometer: ''
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading fuel logs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fuel Logs</h2>
          <p className="text-gray-500 mt-1">Track fuel consumption with anomaly detection</p>
        </div>
        {canCreate && (
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Fuel Log
        </Button>
        )}
      </div>

      {/* Add Form */}
      {showForm && canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Add Fuel Log</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Vehicle</Label>
                  <Select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} - {v.licensePlate}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Liters Filled</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.litersFilled}
                    onChange={(e) => setFormData({ ...formData, litersFilled: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Cost Per Liter ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costPerLiter}
                    onChange={(e) => setFormData({ ...formData, costPerLiter: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Odometer Reading (km)</Label>
                  <Input
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Fuel Station</Label>
                  <Input
                    value={formData.fuelStation}
                    onChange={(e) => setFormData({ ...formData, fuelStation: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Create Log</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Fuel Logs List */}
      <div className="space-y-3">
        {fuelLogs.map((log) => (
          <Card key={log._id} className={log.isAnomalous ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {log.vehicle?.name} - {log.vehicle?.licensePlate}
                    </h3>
                    {log.isAnomalous && (
                      <Badge variant="Cancelled">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Anomaly Detected
                      </Badge>
                    )}
                  </div>
                  
                  {log.isAnomalous && log.anomalyReason && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                      <p className="text-sm text-red-800 font-medium flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {log.anomalyReason}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Liters Filled</p>
                      <p className="font-medium">{log.litersFilled} L</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cost/Liter</p>
                      <p className="font-medium">{formatCurrency(log.costPerLiter)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Cost</p>
                      <p className="font-medium">{formatCurrency(log.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Odometer</p>
                      <p className="font-medium">{log.odometer} km</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fuel Station</p>
                      <p className="font-medium">{log.fuelStation}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Logged on {formatDate(log.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fuelLogs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No fuel logs found. Add your first fuel log to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
