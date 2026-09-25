const prisma = require("./prisma");

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("[DB] PostgreSQL connected successfully via Prisma");
    return prisma;
  } catch (err) {
    console.error("[DB] PostgreSQL Database connection error:", err.message);
    // Continue running gracefully even if DB is offline during startup
  }
};

module.exports = connectDB;
