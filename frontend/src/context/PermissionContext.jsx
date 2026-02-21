/**
 * PermissionContext — thin wrapper that exposes hasPermission()
 * consumed by RoleBasedButton and any component that needs gate checks.
 * Re-exports everything from AuthContext so callers only need one import.
 */
import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'

const PermissionContext = createContext(null)

export function PermissionProvider({ children }) {
  const auth = useAuth()
  return (
    <PermissionContext.Provider value={auth}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const ctx = useContext(PermissionContext)
  // fall back to AuthContext directly if PermissionProvider not mounted above
  const auth = useAuth()
  return ctx || auth
}
