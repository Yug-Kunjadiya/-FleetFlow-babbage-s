/**
 * RBAC Permission Matrix
 * Defines what each role can do for each resource
 * Actions: create, read, update, delete
 */

const rolePermissions = {
  "Fleet Manager": {
    vehicles: ["create", "read", "update", "delete"],
    drivers: ["create", "read", "update", "delete"],
    trips: ["create", "read", "update", "delete"],
    fuelLogs: ["create", "read", "update", "delete"],
    maintenance: ["create", "read", "update", "delete"],
    analytics: ["read"],
    financial: ["read"],
    dashboard: ["read"],
    export: ["read"]
  },

  "Dispatcher": {
    vehicles: ["read"],
    drivers: ["read"],
    trips: ["create", "read", "update"],
    fuelLogs: [],
    maintenance: [],
    analytics: [],
    financial: [],
    dashboard: ["read"],
    export: []
  },

  "Safety Officer": {
    vehicles: ["read"],
    drivers: ["read", "update"],
    trips: ["read"],
    fuelLogs: [],
    maintenance: ["create", "read", "update"],
    analytics: [],
    financial: [],
    dashboard: ["read"],
    export: []
  },

  "Financial Analyst": {
    vehicles: ["read"],
    drivers: [],
    trips: ["read"],
    fuelLogs: ["read"],
    maintenance: ["read"],
    analytics: ["read"],
    financial: ["read"],
    dashboard: ["read"],
    export: ["read"]
  }
};

/**
 * Sidebar menu configuration for each role
 */
const roleSidebarMenus = {
  "Fleet Manager": [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Vehicles", path: "/vehicles", icon: "Truck" },
    { name: "Drivers", path: "/drivers", icon: "Users" },
    { name: "Trips", path: "/trips", icon: "Route" },
    { name: "Fuel Logs", path: "/fuel-logs", icon: "Fuel" },
    { name: "Maintenance", path: "/maintenance", icon: "Wrench" },
    { name: "Analytics", path: "/analytics", icon: "BarChart" }
  ],

  "Dispatcher": [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Vehicles", path: "/vehicles", icon: "Truck" },
    { name: "Drivers", path: "/drivers", icon: "Users" },
    { name: "Trips", path: "/trips", icon: "Route" }
  ],

  "Safety Officer": [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Drivers", path: "/drivers", icon: "Users" },
    { name: "Vehicles", path: "/vehicles", icon: "Truck" },
    { name: "Maintenance", path: "/maintenance", icon: "Wrench" }
  ],

  "Financial Analyst": [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Analytics", path: "/analytics", icon: "BarChart" },
    { name: "Fuel Logs", path: "/fuel-logs", icon: "Fuel" },
    { name: "Vehicles", path: "/vehicles", icon: "Truck" }
  ]
};

/**
 * Check if a role has permission to perform an action on a resource
 * @param {string} role - User's role
 * @param {string} resource - Resource name (vehicles, drivers, etc.)
 * @param {string} action - Action to perform (create, read, update, delete)
 * @returns {boolean} - True if allowed
 */
const hasPermission = (role, resource, action) => {
  if (!rolePermissions[role]) {
    return false;
  }

  if (!rolePermissions[role][resource]) {
    return false;
  }

  return rolePermissions[role][resource].includes(action);
};

/**
 * Get all permissions for a role
 * @param {string} role - User's role
 * @returns {object} - All permissions for the role
 */
const getRolePermissions = (role) => {
  return rolePermissions[role] || {};
};

/**
 * Get sidebar menu items for a role
 * @param {string} role - User's role
 * @returns {array} - Menu items for the role
 */
const getRoleSidebarMenus = (role) => {
  return roleSidebarMenus[role] || [];
};

module.exports = {
  rolePermissions,
  roleSidebarMenus,
  hasPermission,
  getRolePermissions,
  getRoleSidebarMenus
};
