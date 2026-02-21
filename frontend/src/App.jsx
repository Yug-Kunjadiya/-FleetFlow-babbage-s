import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Auth pages
import Login from './pages/Login'
import Register from './pages/Register'
import ManagerLogin from './pages/ManagerLogin'
import DispatcherLogin from './pages/DispatcherLogin'
import SafetyLogin from './pages/SafetyLogin'
import FinancialLogin from './pages/FinancialLogin'

// Role-specific dashboards
import ManagerDashboard    from './pages/dashboards/ManagerDashboard'
import DispatcherDashboard from './pages/dashboards/DispatcherDashboard'
import SafetyDashboard     from './pages/dashboards/SafetyDashboard'
import FinancialDashboard  from './pages/dashboards/FinancialDashboard'

// Shared feature pages
import Vehicles        from './pages/Vehicles'
import Drivers         from './pages/Drivers'
import Trips           from './pages/Trips'
import FuelLogs        from './pages/FuelLogs'
import MaintenanceLogs from './pages/MaintenanceLogs'
import Analytics       from './pages/Analytics'
import Unauthorized    from './pages/Unauthorized'

// ── Loading spinner ────────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-gray-500 text-sm">Loading FleetFlow…</p>
  </div>
)

// ── Requires authentication ────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading)  return <Spinner />
  if (!user)    return <Navigate to="/login" replace />
  return children
}

// ── Redirect logged-in users away from login pages ─────────────
function LoginRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading)  return <Spinner />
  if (user)     return <Navigate to="/" replace />
  return children
}

/**
 * RoleRoute — wraps a page with permission enforcement.
 * If the current user's role is NOT allowed to visit this path,
 * they are redirected to /unauthorized instead of seeing the page.
 */
function RoleRoute({ path, children }) {
  const { isRouteAllowed } = useAuth()
  if (!isRouteAllowed(path)) {
    return <Navigate to="/unauthorized" replace />
  }
  return children
}

// ── Role-based Dashboard selector ──────────────────────────────
function RoleDashboard() {
  const { user } = useAuth()
  switch (user?.role) {
    case 'Fleet Manager':    return <ManagerDashboard />
    case 'Dispatcher':       return <DispatcherDashboard />
    case 'Safety Officer':   return <SafetyDashboard />
    case 'Financial Analyst':return <FinancialDashboard />
    default:                 return <Navigate to="/login" replace />
  }
}

// ── App ────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px', maxWidth: '420px' },
          error: { duration: 5000 }
        }}
      />
      <Routes>
        {/* Login pages — redirect to dashboard if already authenticated */}
        <Route path="/login"            element={<LoginRoute><Login /></LoginRoute>} />
        <Route path="/register"         element={<LoginRoute><Register /></LoginRoute>} />
        <Route path="/login/manager"    element={<LoginRoute><ManagerLogin /></LoginRoute>} />
        <Route path="/login/dispatcher" element={<LoginRoute><DispatcherLogin /></LoginRoute>} />
        <Route path="/login/safety"     element={<LoginRoute><SafetyLogin /></LoginRoute>} />
        <Route path="/login/financial"  element={<LoginRoute><FinancialLogin /></LoginRoute>} />

        {/* Unauthorized access page */}
        <Route path="/unauthorized" element={
          <ProtectedRoute><Unauthorized /></ProtectedRoute>
        } />

        {/* All protected app pages inside Layout */}
        <Route path="/" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          {/* Dashboard — renders the role-specific component automatically */}
          <Route index element={<RoleDashboard />} />

          {/* Feature pages — each wrapped with RoleRoute */}
          <Route path="vehicles" element={
            <RoleRoute path="/vehicles"><Vehicles /></RoleRoute>
          } />
          <Route path="drivers" element={
            <RoleRoute path="/drivers"><Drivers /></RoleRoute>
          } />
          <Route path="trips" element={
            <RoleRoute path="/trips"><Trips /></RoleRoute>
          } />
          <Route path="fuel-logs" element={
            <RoleRoute path="/fuel-logs"><FuelLogs /></RoleRoute>
          } />
          <Route path="maintenance-logs" element={
            <RoleRoute path="/maintenance-logs"><MaintenanceLogs /></RoleRoute>
          } />
          <Route path="analytics" element={
            <RoleRoute path="/analytics"><Analytics /></RoleRoute>
          } />
        </Route>

        {/* Catch-all → redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
