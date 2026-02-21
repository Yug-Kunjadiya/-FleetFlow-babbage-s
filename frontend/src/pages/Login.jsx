import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Settings, MapPin, Shield, DollarSign, Truck } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()

  const roles = [
    {
      name: 'Fleet Manager',
      description: 'Complete fleet control and management',
      icon: Settings,
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      iconBg: 'bg-blue-600',
      path: '/login/manager'
    },
    {
      name: 'Dispatcher',
      description: 'Trip planning and route optimization',
      icon: MapPin,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      iconBg: 'bg-emerald-600',
      path: '/login/dispatcher'
    },
    {
      name: 'Safety Officer',
      description: 'Compliance and safety monitoring',
      icon: Shield,
      color: 'from-orange-600 to-amber-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      iconBg: 'bg-orange-600',
      path: '/login/safety'
    },
    {
      name: 'Financial Analyst',
      description: 'Financial reports and cost analysis',
      icon: DollarSign,
      color: 'from-purple-600 to-fuchsia-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      iconBg: 'bg-purple-600',
      path: '/login/financial'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg">
                <Truck className="w-16 h-16 text-white" />
              </div>
            </div>
            <CardTitle className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FleetFlow
            </CardTitle>
            <CardDescription className="text-xl">
              Fleet & Logistics Management System
            </CardDescription>
            <p className="text-gray-600">Choose your role to continue</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.name}
                    onClick={() => navigate(role.path)}
                    className={`${role.bgColor} border-2 border-gray-200 rounded-xl p-6 transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-left`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${role.iconBg} p-3 rounded-lg flex-shrink-0`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${role.color} bg-clip-text text-transparent`}>
                          {role.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-600 mb-3">Demo Credentials (all roles):</p>
              <p className="text-xs text-gray-500">
                Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">password123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
