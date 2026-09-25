const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

async function main() {
  const username = process.argv[2] || "admin";
  const email = process.argv[3] || "admin@carryio.com";
  const password = process.argv[4] || "admin123";

  const existing = await prisma.manager.findUnique({ where: { email } });
  if (existing) {
    console.log(`Manager with email '${email}' already exists.`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const manager = await prisma.manager.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  console.log("✅ Manager created successfully!");
  console.log(` - ID: ${manager.id}`);
  console.log(` - Username: ${manager.username}`);
  console.log(` - Email: ${manager.email}`);
}

main()
  .catch((e) => {
    console.error("Error creating manager:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
