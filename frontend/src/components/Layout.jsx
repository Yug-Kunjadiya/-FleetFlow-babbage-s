import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Truck, Users, Map, Fuel,
  Wrench, BarChart3, LogOut, Menu, X,
  Shield, Sun, Moon, Bell, ChevronRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const ICON_MAP = { LayoutDashboard, Truck, Users, Map, Fuel, Wrench, BarChart3 }

const ROLE_STYLES = {
  'Fleet Manager':    'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'Dispatcher':       'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'Safety Officer':   'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  'Financial Analyst':'bg-purple-500/20 text-purple-300 border border-purple-500/30',
}

const ROLE_BADGE = {
  'Fleet Manager':    'bg-blue-100 text-blue-700',
  'Dispatcher':       'bg-emerald-100 text-emerald-700',
  'Safety Officer':   'bg-sky-100 text-sky-700',
  'Financial Analyst':'bg-purple-100 text-purple-700',
}

export default function Layout() {
  const { user, logout, getSidebarMenus } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  const navigation = getSidebarMenus()
  const currentPageName =
    navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64
        bg-gray-950 dark:bg-gray-950 border-r border-gray-800/60
        shadow-xl shadow-black/20
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-700/40">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">FleetFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User chip */}
        <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate leading-tight">{user?.name}</p>
              <p className="text-gray-500 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-2
            ${ROLE_STYLES[user?.role] || 'bg-gray-700 text-gray-300'}`}>
            <Shield className="w-2.5 h-2.5" />
            {user?.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest px-3 mb-2">Navigation</p>
          {navigation.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard
            const isActive = location.pathname === item.href
            return (
              <Link key={item.name} to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-700/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm">{item.name}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800 flex-shrink-0">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-150">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 bg-gray-50 dark:bg-gray-900 ${sidebarOpen ? 'lg:ml-64' : ''}`}>

        {/* Top navbar */}
        <header className="h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800
          flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30 shadow-sm">

          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-800 dark:text-white">{currentPageName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden md:block text-xs text-gray-400 dark:text-gray-500 mr-2">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle dark mode">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Bell */}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center relative
              text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 ml-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 dark:text-white leading-none mb-0.5">{user?.name}</p>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full
                  ${ROLE_BADGE[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in text-gray-900 dark:text-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

