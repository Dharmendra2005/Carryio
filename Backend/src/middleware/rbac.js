/**
 * Role-Based Access Control Middleware (Stage 8 - Security & Roles)
 * Controls endpoint permissions for CUSTOMER, DELIVERY_AGENT, and ADMIN roles.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before role verification",
      });
    }

    // Normalize roles (support user -> CUSTOMER, manager -> ADMIN for backward compatibility)
    let userRole = (req.user.role || "CUSTOMER").toUpperCase();
    if (userRole === "USER") userRole = "CUSTOMER";
    if (userRole === "MANAGER") userRole = "ADMIN";

    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole) && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${userRole}' does not have sufficient permissions. Requires one of: [${allowedRoles.join(", ")}]`,
      });
    }

    req.user.role = userRole;
    next();
  };
};

module.exports = authorizeRoles;
