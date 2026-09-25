const jwt = require("jsonwebtoken");
const env = require("../config/env");
const redis = require("../config/redis");
const prisma = require("../config/prisma");

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const match = authHeader.match(/^bearer\s+(.+)$/i);
    if (match) {
      return match[1].trim();
    }
  }
  return req.cookies?.token;
}

const authMiddleware = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing",
    });
  }

  // 1. Check Redis token blacklist
  const isBlacklistedInRedis = await redis.get(`blacklist:${token}`);
  if (isBlacklistedInRedis) {
    return res.status(401).json({
      success: false,
      message: "Token has been revoked or invalidated",
    });
  }

  // 2. Fallback check DB token blacklist
  try {
    const dbBlacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    });
    if (dbBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token is blacklisted",
      });
    }
  } catch (dbErr) {
    // ignore if DB is offline or fallback check fails
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
