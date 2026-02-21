import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

/**
 * Role-based sidebar menu definitions (frontend mirror of backend config)
 */
const ROLE_MENUS = {
  "Fleet Manager": [
    { name: 'Dashboard',   href: '/',                icon: 'LayoutDashboard' },
    { name: 'Vehicles',    href: '/vehicles',         icon: 'Truck'           },
    { name: 'Drivers',     href: '/drivers',          icon: 'Users'           },
    { name: 'Trips',       href: '/trips',            icon: 'Map'             },
    { name: 'Fuel Logs',   href: '/fuel-logs',        icon: 'Fuel'            },
    { name: 'Maintenance', href: '/maintenance-logs', icon: 'Wrench'          },
    { name: 'Analytics',   href: '/analytics',        icon: 'BarChart3'       },
  ],
  "Dispatcher": [
    { name: 'Dashboard',   href: '/',                icon: 'LayoutDashboard' },
    { name: 'Vehicles',    href: '/vehicles',         icon: 'Truck'           },
    { name: 'Drivers',     href: '/drivers',          icon: 'Users'           },
    { name: 'Trips',       href: '/trips',            icon: 'Map'             },
  ],
  "Safety Officer": [
    { name: 'Dashboard',   href: '/',                icon: 'LayoutDashboard' },
    { name: 'Drivers',     href: '/drivers',          icon: 'Users'           },
    { name: 'Vehicles',    href: '/vehicles',         icon: 'Truck'           },
    { name: 'Maintenance', href: '/maintenance-logs', icon: 'Wrench'          },
  ],
  "Financial Analyst": [
    { name: 'Dashboard',   href: '/',                icon: 'LayoutDashboard' },
    { name: 'Analytics',   href: '/analytics',        icon: 'BarChart3'       },
    { name: 'Fuel Logs',   href: '/fuel-logs',        icon: 'Fuel'            },
    { name: 'Vehicles',    href: '/vehicles',         icon: 'Truck'           },
  ],
};

/** Allowed routes per role — used for frontend route enforcement */
const ROLE_ALLOWED_ROUTES = {
  "Fleet Manager":     ['/', '/vehicles', '/drivers', '/trips', '/fuel-logs', '/maintenance-logs', '/analytics'],
  "Dispatcher":        ['/', '/vehicles', '/drivers', '/trips'],
  "Safety Officer":    ['/', '/vehicles', '/drivers', '/maintenance-logs'],
  "Financial Analyst": ['/', '/analytics', '/fuel-logs', '/vehicles'],
};

export { ROLE_ALLOWED_ROUTES };

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const token       = localStorage.getItem('token');
      const storedUser  = localStorage.getItem('user');
      const storedPerms = localStorage.getItem('permissions');
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setPermissions(storedPerms ? JSON.parse(storedPerms) : {});
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user, permissions: perms } = response.data;
      localStorage.setItem('token',       token);
      localStorage.setItem('user',        JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(perms || {}));
      setUser(user);
      setPermissions(perms || {});
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    setUser(null);
    setPermissions({});
    toast.success('Logged out successfully');
  };

  /** Check if current user can perform action on resource */
  const hasPermission = (resource, action) => {
    if (!user) return false;
    return permissions[resource]?.includes(action) ?? false;
  };

  /** Get sidebar menu items for the current user role */
  const getSidebarMenus = () => {
    if (!user) return [];
    return ROLE_MENUS[user.role] || [];
  };

  /** Check if a route path is allowed for current user */
  const isRouteAllowed = (path) => {
    if (!user) return false;
    const allowed = ROLE_ALLOWED_ROUTES[user.role] || [];
    return allowed.includes(path);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user, permissions, loading,
      login, logout, hasRole,
      hasPermission, getSidebarMenus, isRouteAllowed,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
