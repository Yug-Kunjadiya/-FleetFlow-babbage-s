import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import { Plus, Edit, Trash2, Shield, AlertTriangle, UserX, UserCheck, Users, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

function StatusBadge({ status }) {
  const map = {
    'On Duty':      'bg-emerald-100 text-emerald-800 border border-emerald-200',
    'Off Duty':     'bg-gray-100 text-gray-700 border border-gray-200',
    'On Trip':      'bg-blue-100 text-blue-800 border border-blue-200',
    'Suspended':    'bg-red-100 text-red-800 border border-red-200',
    'Under Review': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'High Risk':    'bg-red-100 text-red-800 border border-red-300 font-bold',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function SafetyScoreBadge({ score }) {
  const color = score >= 85 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'
  const bg    = score >= 85 ? 'bg-emerald-50' : score >= 70 ? 'bg-amber-50' : 'bg-red-50'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${color} ${bg}`}>
      {score ?? 'N/A'}
    </span>
  )
}

export default function Drivers() {
  const { hasPermission, user } = useAuth()
  const canCreate = hasPermission('drivers', 'create')
  const canEdit   = hasPermission('drivers', 'update')
  const canDelete = hasPermission('drivers', 'delete')
  const isSafety  = user?.role === 'Safety Officer'

  const [drivers, setDrivers]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [formData, setFormData]         = useState({
    name: '', licenseNumber: '', licenseCategory: 'C',
    licenseExpiryDate: '', phone: '', email: '', status: 'Off Duty'
  })

  useEffect(() => { fetchDrivers() }, [])

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers')
      setDrivers(response.data.data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver._id}`, formData)
        toast.success('Driver updated')
      } else {
        await api.post('/drivers', formData)
        toast.success('Driver created')
      }
      setShowForm(false); setEditingDriver(null); resetForm(); fetchDrivers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const updateSafetyScore = async (driverId) => {
    try {
      await api.post(`/drivers/${driverId}/update-safety-score`)
      toast.success('Safety score updated')
      fetchDrivers()
    } catch (error) {
      toast.error('Failed to update safety score')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return
    try {
      await api.delete(`/drivers/${id}`)
      toast.success('Driver deleted')
      fetchDrivers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  /** Safety Officer: suspend / unsuspend driver */
  const toggleSuspend = async (driver) => {
    const newStatus = driver.status === 'Suspended' ? 'Off Duty' : 'Suspended'
    try {
      await api.put(`/drivers/${driver._id}`, { status: newStatus })
      toast.success(`Driver ${newStatus === 'Suspended' ? 'suspended' : 'unsuspended'}`)
      fetchDrivers()
    } catch (error) {
      toast.error('Failed to update driver status')
    }
  }

  /** Safety Officer: mark / clear Under Review */
  const markReview = async (driver) => {
    const next = driver.status === 'Under Review' ? 'Off Duty' : 'Under Review'
    try {
      await api.put(`/drivers/${driver._id}`, { status: next })
      toast.success(next === 'Under Review' ? 'Driver marked for review' : 'Review cleared')
      fetchDrivers()
    } catch (error) {
      toast.error('Failed to update driver status')
    }
  }

  const resetForm = () => setFormData({
    name: '', licenseNumber: '', licenseCategory: 'C',
    licenseExpiryDate: '', phone: '', email: '', status: 'Off Duty'
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Driver Management</h1>
              <p className="text-purple-100 text-sm mt-0.5">{drivers.length} drivers registered</p>
            </div>
          </div>
          {canCreate && (
            <Button
              onClick={() => { setShowForm(!showForm); setEditingDriver(null); resetForm() }}
              className="bg-white text-purple-700 hover:bg-purple-50 shadow font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Driver
            </Button>
          )}
        </div>
      </div>

      {/* Safety Officer notice */}
      {isSafety && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            Safety Officer mode — you can suspend drivers, update statuses, and flag ambiguous risks.
          </p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && canCreate && (
        <Card className="border-purple-200 dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</CardTitle>
              <button onClick={() => { setShowForm(false); setEditingDriver(null); resetForm() }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="dark:text-gray-300">Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required className="dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-gray-300">License Number</Label>
                  <Input value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    required className="dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-gray-300">License Category</Label>
                  <Select value={formData.licenseCategory} onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    {['A','B','C','D','E'].map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label className="dark:text-gray-300">License Expiry</Label>
                  <Input type="date" value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    required className="dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Status</Label>
                  <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Suspended">Suspended</option>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  {editingDriver ? 'Update' : 'Create'} Driver
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingDriver(null); resetForm() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Driver cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <Card key={driver._id} className="card-hover dark:bg-gray-900 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500
                    flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {driver.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm dark:text-white truncate">{driver.name}</CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{driver.licenseNumber}</p>
                  </div>
                </div>
                <StatusBadge status={driver.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
                <div className="text-gray-500 dark:text-gray-400">Category</div>
                <div className="font-medium dark:text-gray-200 text-right">Class {driver.licenseCategory}</div>
                <div className="text-gray-500 dark:text-gray-400">Expiry</div>
                <div className={`font-medium text-right ${driver.isLicenseExpired ? 'text-red-600' : 'dark:text-gray-200'}`}>
                  {formatDate(driver.licenseExpiryDate)}{driver.isLicenseExpired && ' ⚠️'}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Safety Score</div>
                <div className="text-right"><SafetyScoreBadge score={driver.safetyScore} /></div>
                <div className="text-gray-500 dark:text-gray-400">Trips</div>
                <div className="font-medium dark:text-gray-200 text-right">{driver.completedTrips}/{driver.totalTrips}</div>
                {driver.phone && <>
                  <div className="text-gray-500 dark:text-gray-400">Phone</div>
                  <div className="font-medium dark:text-gray-200 text-right">{driver.phone}</div>
                </>}
              </div>

              <div className="flex gap-1.5 flex-wrap">


                {/* Safety Officer: suspend toggle */}
                {isSafety && (
                  <Button size="sm" variant="outline"
                    onClick={() => toggleSuspend(driver)}
                    className={`text-xs gap-1 px-2 ${
                      driver.status === 'Suspended'
                        ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400'
                        : 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400'
                    }`}>
                    {driver.status === 'Suspended'
                      ? <><UserCheck className="w-3 h-3" /> Unsuspend</>
                      : <><UserX className="w-3 h-3" /> Suspend</>
                    }
                  </Button>
                )}

                {/* Safety Officer: mark under review */}
                {isSafety && (
                  <Button size="sm" variant="outline"
                    onClick={() => markReview(driver)}
                    className={`text-xs gap-1 px-2 ${
                      driver.status === 'Under Review'
                        ? 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400'
                        : 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400'
                    }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {driver.status === 'Under Review' ? 'Clear Review' : 'Mark Review'}
                  </Button>
                )}

                {/* Fleet Manager only */}
                {canEdit && (
                  <Button size="sm" variant="outline"
                    onClick={() => {
                      setEditingDriver(driver)
                      setFormData({
                        name: driver.name, licenseNumber: driver.licenseNumber,
                        licenseCategory: driver.licenseCategory,
                        licenseExpiryDate: driver.licenseExpiryDate?.split('T')[0] || '',
                        phone: driver.phone || '', email: driver.email || '', status: driver.status
                      })
                      setShowForm(true)
                    }}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(driver._id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {drivers.length === 0 && (
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No drivers found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first driver to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
