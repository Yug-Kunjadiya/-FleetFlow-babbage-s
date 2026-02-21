import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Plus, Wrench, AlertCircle, MessageCircle, X, Send } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

// Chatbot API Configuration
const CHATBOT_API_KEY = 'DEBUG-KEY-12345'

export default function MaintenanceLogs() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission('maintenance', 'create')
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPrediction, setShowPrediction] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [formData, setFormData] = useState({
    vehicle: '',
    serviceType: 'Oil Change',
    description: '',
    cost: '',
    serviceDate: new Date().toISOString().split('T')[0]
  })
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your FleetFlow maintenance assistant. How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
    fetchVehicles()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/maintenance-logs')
      setLogs(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching logs:', error)
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

  const predictMaintenance = async (vehicleId) => {
    try {
      const response = await api.get(`/maintenance-logs/predict/${vehicleId}`)
      const data = response.data.data
      
      // Calculate urgency if not provided by AI service
      if (!data.urgency) {
        let urgency = 'low'
        if (data.needsMaintenance) {
          if (data.daysUntilService === 0 || data.daysUntilService === null) {
            urgency = 'critical'
          } else if (data.daysUntilService <= 7) {
            urgency = 'critical'
          } else if (data.daysUntilService <= 30) {
            urgency = 'moderate'
          }
        }
        data.urgency = urgency
      }
      
      // Ensure recommendedActions exists
      if (!data.recommendedActions || data.recommendedActions.length === 0) {
        data.recommendedActions = ['Schedule maintenance inspection']
      }
      
      setPrediction(data)
      setShowPrediction(true)
      toast.success('Maintenance prediction generated')
    } catch (error) {
      console.error('Prediction error:', error)
      toast.error('Failed to get prediction')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/maintenance-logs', formData)
      toast.success('Maintenance log created successfully')
      setShowForm(false)
      resetForm()
      fetchLogs()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const resetForm = () => {
    setFormData({
      vehicle: '',
      serviceType: 'Oil Change',
      description: '',
      cost: '',
      serviceDate: new Date().toISOString().split('T')[0]
    })
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      // Call the real AI chatbot API
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()
      
      if (data.success) {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
      
      setChatLoading(false)
    } catch (error) {
      console.error('Chatbot error:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please make sure the backend server is running and try again.' 
      }])
      setChatLoading(false)
    }
  }

  const getUrgencyColor = (urgency) => {
    if (urgency === 'critical') return 'text-red-600 bg-red-100'
    if (urgency === 'moderate') return 'text-yellow-600 bg-yellow-100'
    if (urgency === 'low') return 'text-blue-600 bg-blue-100'
    if (urgency === 'none') return 'text-green-600 bg-green-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading maintenance logs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Maintenance Logs</h2>
          <p className="text-gray-500 mt-1">Track maintenance with predictive AI</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowChatbot(!showChatbot)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          {canCreate && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Log
          </Button>
          )}
        </div>
      </div>

      {/* AI Chatbot Panel */}
      {showChatbot && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-blue-600">
                <MessageCircle className="w-5 h-5 mr-2" />
                FleetFlow AI Assistant
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  API: {CHATBOT_API_KEY}
                </span>
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowChatbot(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Typing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask about maintenance, costs, predictions..."
                className="flex-1"
              />
              <Button 
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Panel */}
      {showPrediction && prediction && (
        <Card className={`border-2 ${
          prediction.urgency === 'critical' 
            ? 'border-red-500 bg-red-50' 
            : prediction.urgency === 'moderate' 
            ? 'border-yellow-500 bg-yellow-50'
            : prediction.urgency === 'low'
            ? 'border-blue-500 bg-blue-50'
            : 'border-green-500 bg-green-50'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Predictive Maintenance Analysis
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPrediction(false)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(prediction.urgency)}`}>
                  {prediction.urgency?.toUpperCase() || 'UNKNOWN'} URGENCY
                </span>
                <span className="text-sm text-gray-600">
                  Days until service: <strong>{prediction.daysUntilService ?? 'N/A'}</strong>
                </span>
              </div>
              
              {prediction.confidence && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Confidence: <strong className="capitalize">{prediction.confidence}</strong>
                  </span>
                </div>
              )}
              
              {prediction.reasons && prediction.reasons.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Reasons:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {prediction.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {prediction.recommendedActions && prediction.recommendedActions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended Actions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {prediction.recommendedActions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Form */}
      {showForm && canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Add Maintenance Log</CardTitle>
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
                  <Label>Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  >
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Replacement">Tire Replacement</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Transmission Service">Transmission Service</option>
                    <option value="Battery Replacement">Battery Replacement</option>
                    <option value="AC Service">AC Service</option>
                    <option value="Inspection">Inspection</option>
                    <option value="General Maintenance">General Maintenance</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div>
                  <Label>Service Date</Label>
                  <Input
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Cost ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Details about the maintenance work..."
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

      {/* Vehicles with Predict Button */}
      <Card>
        <CardHeader>
          <CardTitle>Predict Maintenance Needs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{vehicle.name}</p>
                  <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => predictMaintenance(vehicle._id)}
                >
                  <Wrench className="w-4 h-4 mr-1" />
                  Predict
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Logs List */}
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log._id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {log.vehicle?.name} - {log.vehicle?.licensePlate}
                    </h3>
                    <Badge variant="Active">{log.serviceType}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Service Date</p>
                      <p className="font-medium">{formatDate(log.serviceDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cost</p>
                      <p className="font-medium">{formatCurrency(log.cost)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Description</p>
                      <p className="font-medium">{log.description || 'N/A'}</p>
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

      {logs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No maintenance logs found. Add your first log to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
