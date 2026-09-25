const prisma = require("../config/prisma");

/**
 * Audit Logging Utility (Stage 8 - Security & Audit)
 * Records security-sensitive operations in audit logs using Prisma PostgreSQL.
 */
const logAudit = async ({ userId, action, resource, ipAddress = "", details = {} }) => {
  try {
    const detailsStr = typeof details === "object" ? JSON.stringify(details) : String(details);

    console.log(`[AuditLog] 🛡️ Action: ${action} | Resource: ${resource} | User: ${userId || "System"}`);
    
    await prisma.auditLog.create({
      data: {
        userId: userId ? String(userId) : null,
        action,
        resource,
        ipAddress,
        details: detailsStr,
      },
    });
  } catch (err) {
    console.error("[AuditLog Error] Failed to write audit log:", err.message);
  }
};

module.exports = logAudit;
