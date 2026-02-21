import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Settings, Truck, AlertCircle } from 'lucide-react'

export default function ManagerLogin() {
  const [email, setEmail] = useState('manager@fleetflow.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)

    if (result.success) {
      if (result.user?.role !== 'Fleet Manager') {
        await logout()
        setError(`This login is for Fleet Managers only. Your account role is "${result.user?.role}". Please use the correct login page.`)
        setLoading(false)
        return
      }
      navigate('/')
    } else {
      setError(result.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg">
              <Settings className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Fleet Manager
          </CardTitle>
          <CardDescription className="text-base">
            Complete Fleet Control & Management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@fleetflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Manager'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-center gap-2 mb-4 text-blue-600">
              <Truck className="w-5 h-5" />
              <span className="font-semibold text-lg">FleetFlow</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              <a href="/login/dispatcher" className="text-blue-600 hover:underline">Dispatcher</a>
              <span className="text-gray-400">|</span>
              <a href="/login/safety" className="text-blue-600 hover:underline">Safety Officer</a>
              <span className="text-gray-400">|</span>
              <a href="/login/financial" className="text-blue-600 hover:underline">Financial Analyst</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
