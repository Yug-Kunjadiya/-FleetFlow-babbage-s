const { hasPermission } = require('../config/permissions');

/**
 * RBAC Middleware - Check if user has permission to perform action on resource
 * @param {string} resource - Resource name (vehicles, drivers, trips, etc.)
 * @param {string} action - Action to perform (create, read, update, delete)
 * @returns {function} - Express middleware function
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      // User should be attached to request by auth middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;

      // Check if user has permission
      if (!hasPermission(userRole, resource, action)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your role (${userRole}) does not have permission to ${action} ${resource}.`,
          requiredPermission: {
            resource,
            action
          }
        });
      }

      // User has permission, proceed
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {array} permissions - Array of {resource, action} objects
 * @returns {function} - Express middleware function
 */
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      
      // Check if user has any of the permissions
      const hasAny = permissions.some(({ resource, action }) => 
        hasPermission(userRole, resource, action)
      );

      if (!hasAny) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your role (${userRole}) does not have the required permissions.`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
};

/**
 * Check if user has specific role(s)
 * @param {string|array} allowedRoles - Role or array of roles allowed
 * @returns {function} - Express middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This feature is only available for: ${roles.join(', ')}`,
          userRole
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking role',
        error: error.message
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkRole
};
