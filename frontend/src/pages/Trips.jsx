import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Plus, Lightbulb } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function Trips() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission('trips', 'create')
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: '',
    cargoWeight: '',
    source: '',
    destination: '',
    distance: '',
    revenue: '',
    estimatedDuration: '',
    status: 'Draft'
  })

  useEffect(() => {
    fetchTrips()
    fetchVehicles()
    fetchDrivers()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips')
      setTrips(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trips:', error)
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles/available')
      setVehicles(response.data.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers/available')
      setDrivers(response.data.data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const getSuggestion = async () => {
    if (!formData.cargoWeight || !formData.distance) {
      toast.error('Please enter cargo weight and distance first')
      return
    }

    try {
      const response = await api.post('/trips/suggest-vehicle', {
        cargoWeight: parseFloat(formData.cargoWeight),
        distance: parseFloat(formData.distance)
      })
      setSuggestion(response.data.data)
      toast.success('AI recommendation generated!')
    } catch (error) {
      toast.error('Failed to get suggestion')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/trips', formData)
      toast.success('Trip created successfully')
      setShowForm(false)
      setSuggestion(null)
      resetForm()
      fetchTrips()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const updateTripStatus = async (tripId, status, additionalData = {}) => {
    try {
      await api.put(`/trips/${tripId}`, { status, ...additionalData })
      toast.success(`Trip ${status.toLowerCase()} successfully`)
      fetchTrips()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    }
  }

  const resetForm = () => {
    setFormData({
      vehicle: '',
      driver: '',
      cargoWeight: '',
      source: '',
      destination: '',
      distance: '',
      revenue: '',
      estimatedDuration: '',
      status: 'Draft'
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading trips...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Trip Dispatcher</h2>
          <p className="text-gray-500 mt-1">Create and manage trips with AI assistance</p>
        </div>
        {canCreate && (
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Trip
        </Button>
        )}
      </div>

      {/* Create Trip Form */}
      {showForm && canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cargo Weight (kg)</Label>
                  <Input
                    type="number"
                    value={formData.cargoWeight}
                    onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Distance (km)</Label>
                  <Input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getSuggestion}
                    className="w-full"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get AI Vehicle Suggestion
                  </Button>
                </div>

                {suggestion && (
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">AI Recommendation:</h4>
                    <p className="text-sm mb-2">Score: {suggestion.recommendation.score}/100</p>
                    <ul className="text-sm space-y-1">
                      {suggestion.recommendation.reasons.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
                        {v.name} - {v.licensePlate} ({v.maxLoadCapacity}kg)
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Driver</Label>
                  <Select
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} - {d.licenseNumber} (Safety: {d.safetyScore})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Source</Label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Destination</Label>
                  <Input
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Revenue ($)</Label>
                  <Input
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estimated Duration (hours)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Initial Status</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Dispatched">Dispatched</option>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Create Trip</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setSuggestion(null)
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

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <Card key={trip._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {trip.source} → {trip.destination}
                  </h3>
                  <p className="text-sm text-gray-500">{trip.distance} km</p>
                </div>
                <Badge variant={trip.status}>{trip.status}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Vehicle</p>
                  <p className="font-medium">{trip.vehicle?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Driver</p>
                  <p className="font-medium">{trip.driver?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cargo Weight</p>
                  <p className="font-medium">{trip.cargoWeight} kg</p>
                </div>
                <div>
                  <p className="text-gray-600">Revenue</p>
                  <p className="font-medium">{formatCurrency(trip.revenue || 0)}</p>
                </div>
              </div>

              {trip.dispatchedAt && (
                <div className="mt-4 text-sm text-gray-600">
                  Dispatched: {formatDateTime(trip.dispatchedAt)}
                </div>
              )}

              <div className="flex space-x-2 mt-4">
                {trip.status === 'Draft' && (
                  <Button
                    size="sm"
                    onClick={() => updateTripStatus(trip._id, 'Dispatched')}
                  >
                    Dispatch
                  </Button>
                )}
                {trip.status === 'Dispatched' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const finalOdometer = prompt('Enter final odometer reading:')
                      if (finalOdometer) {
                        updateTripStatus(trip._id, 'Completed', {
                          finalOdometer: parseFloat(finalOdometer)
                        })
                      }
                    }}
                  >
                    Complete
                  </Button>
                )}
                {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateTripStatus(trip._id, 'Cancelled')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trips.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No trips found. Create your first trip to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
