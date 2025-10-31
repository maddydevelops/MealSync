import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@example.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("Superadmin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("SuperSecret123!", 10);

  const superadmin = await prisma.user.create({
    data: {
      first_name : "Super",
      last_name: "Admin",
      email,
      phone_number: "0000000000",
      password: hashedPassword,
      role: "superadmin",
      is_active: true,
      is_blocked: false,
      address: "Headquarters",
      city: "CityName",
      country: "CountryName",
    },
  });

  console.log("✅ Superadmin created:", superadmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
