import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Settings, MapPin, Shield, DollarSign, Truck, User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'

const ROLES = [
  {
    id: 'Fleet Manager',
    label: 'Fleet Manager',
    description: 'Full control — vehicles, drivers, trips, analytics & financials',
    icon: Settings,
    color: 'from-blue-600 to-indigo-600',
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    selectedBg: 'bg-blue-600 border-blue-600',
    iconBg: 'bg-blue-600',
    features: ['Fleet overview & KPIs', 'Driver management', 'Financial reports', 'Full analytics']
  },
  {
    id: 'Dispatcher',
    label: 'Dispatcher',
    description: 'Plan trips, assign vehicles and drivers, track active dispatches',
    icon: MapPin,
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    selectedBg: 'bg-emerald-600 border-emerald-600',
    iconBg: 'bg-emerald-600',
    features: ['Create & manage trips', 'Vehicle dispatch', 'Driver assignment', 'Route tracking']
  },
  {
    id: 'Safety Officer',
    label: 'Safety Officer',
    description: 'Monitor driver compliance, license status and safety metrics',
    icon: Shield,
    color: 'from-orange-600 to-amber-600',
    bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    selectedBg: 'bg-orange-600 border-orange-600',
    iconBg: 'bg-orange-600',
    features: ['Driver safety scores', 'License expiry alerts', 'Suspend / review drivers', 'Maintenance tracking']
  },
  {
    id: 'Financial Analyst',
    label: 'Financial Analyst',
    description: 'Revenue, expenses, fuel costs and financial performance reports',
    icon: DollarSign,
    color: 'from-purple-600 to-fuchsia-600',
    bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    selectedBg: 'bg-purple-600 border-purple-600',
    iconBg: 'bg-purple-600',
    features: ['Revenue vs expenses', 'Fuel cost analysis', 'Expense breakdowns', 'Financial dashboard']
  }
]

export default function Register() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const [step, setStep] = useState(1)           // 1 = choose role, 2 = fill details
  const [selectedRole, setSelectedRole] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const role = ROLES.find(r => r.id === selectedRole)

  const handleNext = () => {
    if (!selectedRole) { setError('Please select a role to continue.'); return }
    setError('')
    setStep(2)
  }

  const validate = () => {
    if (!form.name.trim())  return 'Full name is required.'
    if (!form.email.trim()) return 'Email address is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: selectedRole
      })
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        // auto-login after registration
        await authLogin(form.email.trim().toLowerCase(), form.password)
        navigate('/')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
          <p className="text-gray-500">Your <span className="font-semibold text-gray-700">{selectedRole}</span> account has been created successfully.</p>
          <button onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition mt-4">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg">
              <Truck className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FleetFlow
          </h1>
          <p className="text-gray-500 mt-1">Create your account to get started</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1,2].map(n => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= n ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
              }`}>{n}</div>
              <span className={`text-sm font-medium ${step >= n ? 'text-blue-600' : 'text-gray-400'}`}>
                {n === 1 ? 'Choose Role' : 'Your Details'}
              </span>
              {n < 2 && <div className={`w-12 h-1 rounded-full ${step > n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ── STEP 1: Role Selection ── */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Select your role</h2>
              <p className="text-gray-500 text-sm mb-6">Choose the role that matches your responsibilities</p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLES.map(r => {
                  const Icon = r.icon
                  const isSelected = selectedRole === r.id
                  return (
                    <button key={r.id} onClick={() => { setSelectedRole(r.id); setError('') }}
                      className={`border-2 rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                        isSelected ? `${r.selectedBg} text-white shadow-lg scale-[1.02]` : `${r.bg} text-gray-800 border-gray-200`
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg flex-shrink-0 ${isSelected ? 'bg-white/20' : r.iconBg}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white'}`} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-white' : `bg-gradient-to-r ${r.color} bg-clip-text text-transparent`}`}>
                            {r.label}
                          </h3>
                          <p className={`text-xs leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            {r.description}
                          </p>
                          <ul className={`mt-3 space-y-1 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                            {r.features.map(f => (
                              <li key={f} className="flex items-center gap-1.5 text-xs">
                                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
                <button onClick={handleNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-2.5 rounded-xl font-semibold hover:opacity-90 transition shadow-md">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Account Details ── */}
          {step === 2 && (
            <div className="p-8">
              {/* Selected role badge */}
              {role && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold mb-6 bg-gradient-to-r ${role.color}`}>
                  <role.icon className="w-4 h-4" />
                  {role.label}
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-1">Account details</h2>
              <p className="text-gray-500 text-sm mb-6">Fill in your information to create your account</p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Enter your full name"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                      required />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" placeholder="you@company.com"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                      required />
                  </div>
                </div>

                {/* Password + Confirm side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                        required />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {form.password && (
                      <div className="mt-1.5 flex gap-1">
                        {[1,2,3,4].map(n => (
                          <div key={n} className={`h-1 flex-1 rounded-full transition-all ${
                            form.password.length >= n * 3
                              ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-amber-400' : n <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                              : 'bg-gray-200'
                          }`} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">
                          {form.password.length < 4 ? 'Weak' : form.password.length < 8 ? 'Fair' : form.password.length < 12 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
                        value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm focus:outline-none transition ${
                          form.confirmPassword && form.confirmPassword !== form.password
                            ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        required />
                      <button type="button" onClick={() => setShowConfirm(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.confirmPassword && form.confirmPassword === form.password && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setStep(1); setError('') }}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Create Account</>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">© 2026 FleetFlow · Built for modern fleet operations</p>
      </div>
    </div>
  )
}
