import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import { Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle, Truck, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

/** Unified status badge */
function StatusBadge({ status }) {
  const map = {
    'Available':    'bg-emerald-100 text-emerald-800 border border-emerald-200',
    'On Trip':      'bg-blue-100 text-blue-800 border border-blue-200',
    'In Shop':      'bg-amber-100 text-amber-800 border border-amber-200',
    'Retired':      'bg-gray-100 text-gray-600 border border-gray-200',
    'Under Review': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'High Risk':    'bg-red-100 text-red-800 border border-red-300 font-bold',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export default function Vehicles() {
  const { hasPermission, user } = useAuth()
  const canCreate = hasPermission('vehicles', 'create')
  const canEdit   = hasPermission('vehicles', 'update')
  const canDelete = hasPermission('vehicles', 'delete')
  const isSafety  = user?.role === 'Safety Officer'

  const [vehicles, setVehicles]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [filters, setFilters]           = useState({ vehicleType: '', status: '', search: '' })
  const [formData, setFormData]         = useState({
    name: '', model: '', licensePlate: '', maxLoadCapacity: '',
    acquisitionCost: '', odometer: '', vehicleType: 'Truck',
    status: 'Available', region: 'North', fuelEfficiency: ''
  })

  useEffect(() => { fetchVehicles() }, [filters])

  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.vehicleType) params.append('vehicleType', filters.vehicleType)
      if (filters.status)      params.append('status',      filters.status)
      if (filters.search)      params.append('search',      filters.search)
      const response = await api.get(`/vehicles?${params.toString()}`)
      setVehicles(response.data.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle._id}`, formData)
        toast.success('Vehicle updated')
      } else {
        await api.post('/vehicles', formData)
        toast.success('Vehicle created')
      }
      setShowForm(false); setEditingVehicle(null); resetForm(); fetchVehicles()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      name: vehicle.name, model: vehicle.model, licensePlate: vehicle.licensePlate,
      maxLoadCapacity: vehicle.maxLoadCapacity, acquisitionCost: vehicle.acquisitionCost,
      odometer: vehicle.odometer, vehicleType: vehicle.vehicleType,
      status: vehicle.status, region: vehicle.region, fuelEfficiency: vehicle.fuelEfficiency
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return
    try {
      await api.delete(`/vehicles/${id}`)
      toast.success('Vehicle deleted')
      fetchVehicles()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  /** Safety Officer: toggle ambiguous risk status */
  const markAmbiguous = async (vehicle) => {
    const next = vehicle.status === 'Under Review' ? 'Available'
               : vehicle.status === 'High Risk'    ? 'Under Review'
               : 'Under Review'
    try {
      await api.put(`/vehicles/${vehicle._id}`, { status: next })
      toast.success(`Vehicle marked as "${next}"`)
      fetchVehicles()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => setFormData({
    name: '', model: '', licensePlate: '', maxLoadCapacity: '',
    acquisitionCost: '', odometer: '', vehicleType: 'Truck',
    status: 'Available', region: 'North', fuelEfficiency: ''
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vehicle Registry</h1>
              <p className="text-blue-100 text-sm mt-0.5">{vehicles.length} vehicles in fleet</p>
            </div>
          </div>
          {canCreate && (
            <Button
              onClick={() => { setShowForm(!showForm); setEditingVehicle(null); resetForm() }}
              className="bg-white text-blue-700 hover:bg-blue-50 shadow font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Vehicle
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search vehicles..."
                className="pl-9 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select value={filters.vehicleType} onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
              className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
              <option value="">All Types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
            </Select>
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Under Review">Under Review</option>
              <option value="High Risk">High Risk</option>
              <option value="Retired">Retired</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && canCreate && (
        <Card className="border-blue-200 dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
              <button onClick={() => { setShowForm(false); setEditingVehicle(null); resetForm() }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Name', key: 'name', type: 'text' },
                  { label: 'Model', key: 'model', type: 'text' },
                  { label: 'License Plate', key: 'licensePlate', type: 'text' },
                  { label: 'Max Load (kg)', key: 'maxLoadCapacity', type: 'number' },
                  { label: 'Acquisition Cost ($)', key: 'acquisitionCost', type: 'number' },
                  { label: 'Odometer (km)', key: 'odometer', type: 'number' },
                  { label: 'Fuel Efficiency (km/l)', key: 'fuelEfficiency', type: 'number', step: '0.1' },
                  { label: 'Region', key: 'region', type: 'text' },
                ].map(({ label, key, type, step }) => (
                  <div key={key}>
                    <Label className="dark:text-gray-300">{label}</Label>
                    <Input type={type} step={step} value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required={['name','model','licensePlate','maxLoadCapacity','acquisitionCost'].includes(key)}
                    />
                  </div>
                ))}
                <div>
                  <Label className="dark:text-gray-300">Vehicle Type</Label>
                  <Select value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                  </Select>
                </div>
                <div>
                  <Label className="dark:text-gray-300">Status</Label>
                  <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingVehicle ? 'Update' : 'Create'} Vehicle
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingVehicle(null); resetForm() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle._id} className="card-hover dark:bg-gray-900 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base dark:text-white truncate">{vehicle.name}</CardTitle>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{vehicle.licensePlate} Â· {vehicle.vehicleType}</p>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
                <div className="text-gray-500 dark:text-gray-400">Model</div>
                <div className="font-medium dark:text-gray-200 text-right">{vehicle.model}</div>
                <div className="text-gray-500 dark:text-gray-400">Capacity</div>
                <div className="font-medium dark:text-gray-200 text-right">{vehicle.maxLoadCapacity?.toLocaleString()} kg</div>
                <div className="text-gray-500 dark:text-gray-400">Odometer</div>
                <div className="font-medium dark:text-gray-200 text-right">{vehicle.odometer?.toLocaleString()} km</div>
                <div className="text-gray-500 dark:text-gray-400">Fuel Eff.</div>
                <div className="font-medium dark:text-gray-200 text-right">{vehicle.fuelEfficiency} km/l</div>
                <div className="text-gray-500 dark:text-gray-400">ROI</div>
                <div className="font-medium text-emerald-600 text-right">{vehicle.roi ?? 0}%</div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* Safety Officer: toggle ambiguous status */}
                {isSafety && (
                  <Button size="sm"
                    variant={vehicle.status === 'Under Review' ? 'outline' : vehicle.status === 'High Risk' ? 'destructive' : 'outline'}
                    onClick={() => markAmbiguous(vehicle)}
                    className="text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {vehicle.status === 'Under Review' ? 'Mark High Risk'
                    : vehicle.status === 'High Risk'   ? 'Clear Flag'
                    : 'Mark Review'}
                  </Button>
                )}

                {/* Fleet Manager only: Edit + Delete */}
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(vehicle._id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {vehicles.length === 0 && (
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="py-16 text-center">
            <Truck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No vehicles found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Adjust filters or add a new vehicle</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

