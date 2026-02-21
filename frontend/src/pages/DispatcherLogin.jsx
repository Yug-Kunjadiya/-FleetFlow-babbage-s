import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { MapPin, Truck } from 'lucide-react'

export default function DispatcherLogin() {
  const [email, setEmail] = useState('dispatcher@fleetflow.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)
    
    setLoading(false)
    
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="bg-emerald-600 p-4 rounded-full shadow-lg">
              <MapPin className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Dispatcher
          </CardTitle>
          <CardDescription className="text-base">
            Trip Planning & Route Optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="dispatcher@fleetflow.com"
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
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Dispatcher'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-center gap-2 mb-4 text-emerald-600">
              <Truck className="w-5 h-5" />
              <span className="font-semibold text-lg">FleetFlow</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              <a href="/login/manager" className="text-emerald-600 hover:underline">Fleet Manager</a>
              <span className="text-gray-400">|</span>
              <a href="/login/safety" className="text-emerald-600 hover:underline">Safety Officer</a>
              <span className="text-gray-400">|</span>
              <a href="/login/financial" className="text-emerald-600 hover:underline">Financial Analyst</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
