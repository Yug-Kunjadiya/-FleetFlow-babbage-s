import { useNavigate, Link } from 'react-router-dom'
import { Settings, MapPin, Shield, DollarSign, Truck, BarChart3, Zap, Globe, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()

  const roles = [
    {
      name: 'Fleet Manager',
      description: 'Full fleet control, analytics & oversight',
      icon: Settings,
      gradient: 'from-blue-500 to-indigo-600',
      ring: 'hover:ring-blue-400',
      badge: 'bg-blue-500/10 text-blue-600 border-blue-200',
      path: '/login/manager'
    },
    {
      name: 'Dispatcher',
      description: 'Trip planning, routing & driver assignment',
      icon: MapPin,
      gradient: 'from-emerald-500 to-teal-600',
      ring: 'hover:ring-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      path: '/login/dispatcher'
    },
    {
      name: 'Safety Officer',
      description: 'Compliance monitoring & safety audits',
      icon: Shield,
      gradient: 'from-sky-500 to-cyan-600',
      ring: 'hover:ring-sky-400',
      badge: 'bg-sky-500/10 text-sky-600 border-sky-200',
      path: '/login/safety'
    },
    {
      name: 'Financial Analyst',
      description: 'Revenue tracking & cost optimization',
      icon: DollarSign,
      gradient: 'from-purple-500 to-fuchsia-600',
      ring: 'hover:ring-purple-400',
      badge: 'bg-purple-500/10 text-purple-600 border-purple-200',
      path: '/login/financial'
    }
  ]

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '50K+', label: 'Trips Tracked' },
    { value: '24/7', label: 'Monitoring' },
  ]

  const features = [
    'Real-time GPS vehicle tracking',
    'AI-powered route optimization',
    'Automated compliance reports',
    'Instant alerts & notifications',
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left panel - dark brand hero */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between
        bg-gray-950 p-10 xl:p-14 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">FleetFlow</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Manage your fleet<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              smarter & faster
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-10">
            The all-in-one platform for modern fleet operations from dispatch to compliance, analytics to cost control.
          </p>

          <ul className="space-y-3 mb-10">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="flex gap-8">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-gray-600 text-xs">
          <Globe className="w-3.5 h-3.5" />
          <span>2026 FleetFlow Built for modern fleet operations</span>
        </div>
      </div>

      {/* Right panel - role selection */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 sm:p-10">
        <div className="w-full max-w-lg">

          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 font-bold text-xl">FleetFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 text-base">Select your role to sign in to your workspace.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <button
                  key={role.name}
                  onClick={() => navigate(role.path)}
                  className={`group relative bg-white border border-gray-200 rounded-2xl p-5 text-left
                    transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
                    ring-2 ring-transparent ${role.ring} focus:outline-none`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.gradient}
                    flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{role.name}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{role.description}</p>
                  <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              )
            })}
          </div>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-500">Don't have an account?</span>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create one for free
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-400" />Fast & secure</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-400" />End-to-end encrypted</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-blue-400" />Live analytics</span>
          </div>
        </div>
      </div>
    </div>
  )
}
