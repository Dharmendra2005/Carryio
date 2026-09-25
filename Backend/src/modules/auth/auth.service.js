const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const redis = require("../../config/redis");
const prisma = require("../../config/prisma");
const logAudit = require("../../utils/auditLogger");

class AuthService {
  generateTokens(user) {
    const role = user.role || "CUSTOMER";
    const payload = {
      id: user.id || user._id,
      email: user.email,
      role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshTokenSecret = env.JWT_REFRESH_SECRET || env.JWT_SECRET + "_refresh";
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken, role };
  }

  async registerUser(userData) {
    const { email, password, firstName, lastName, role = "CUSTOMER" } = userData;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const err = new Error("User with this email already exists");
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRole = ["CUSTOMER", "DELIVERY_AGENT", "ADMIN"].includes(role) ? role : "CUSTOMER";

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: validRole,
      },
    });

    const tokens = this.generateTokens(user);
    logAudit({ userId: user.id, action: "USER_REGISTER", resource: `User:${user.id}`, details: { role: user.role } });

    const { password: _, ...userWithoutPassword } = user;
    return { user: { ...userWithoutPassword, _id: user.id }, ...tokens };
  }

  async loginUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logAudit({ action: "LOGIN_FAILED", resource: `Email:${email}`, details: "User not found" });
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logAudit({ userId: user.id, action: "LOGIN_FAILED", resource: `User:${user.id}`, details: "Incorrect password" });
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    const tokens = this.generateTokens(user);
    logAudit({ userId: user.id, action: "USER_LOGIN_SUCCESS", resource: `User:${user.id}`, details: { role: user.role } });

    const { password: _, ...userWithoutPassword } = user;
    return { user: { ...userWithoutPassword, _id: user.id }, ...tokens };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      const err = new Error("Refresh token required");
      err.statusCode = 401;
      throw err;
    }

    // Check blacklist in Redis
    const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      const err = new Error("Refresh token has been revoked");
      err.statusCode = 401;
      throw err;
    }

    const refreshTokenSecret = env.JWT_REFRESH_SECRET || env.JWT_SECRET + "_refresh";
    try {
      const decoded = jwt.verify(refreshToken, refreshTokenSecret);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        const err = new Error("User associated with token no longer exists");
        err.statusCode = 401;
        throw err;
      }

      const tokens = this.generateTokens(user);
      const { password: _, ...userWithoutPassword } = user;
      return { user: { ...userWithoutPassword, _id: user.id }, ...tokens };
    } catch (err) {
      const error = new Error("Invalid or expired refresh token");
      error.statusCode = 401;
      throw error;
    }
  }

  async logoutUser(token, refreshToken) {
    const tokensToBlacklist = [token, refreshToken].filter(Boolean);

    for (const t of tokensToBlacklist) {
      await redis.set(`blacklist:${t}`, "true", "EX", 604800);
      try {
        await prisma.blacklistedToken.create({ data: { token: t } });
      } catch (e) {
        // ignore duplicate key error
      }
    }
  }
}

module.exports = new AuthService();
