import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldOff } from 'lucide-react'

/**
 * Shown when a user manually navigates to a route not allowed by their role
 */
export default function Unauthorized() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldOff className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-1">
          Your role <span className="font-semibold text-gray-700">({user?.role || 'Unknown'})</span> does not have
          permission to view this page.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Contact your administrator if you believe this is a mistake.
        </p>

        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
