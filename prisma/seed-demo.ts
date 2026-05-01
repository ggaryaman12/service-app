import { Role } from "@prisma/client";

import { hashPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

const demoPassword = "Demo@1234";

const demoUsers = [
  {
    name: "JammuServe Admin",
    email: "admin@jammuserve.test",
    role: Role.ADMIN,
    region: "Jammu"
  },
  {
    name: "JammuServe Manager",
    email: "manager@jammuserve.test",
    role: Role.MANAGER,
    region: "Jammu"
  },
  {
    name: "JammuServe Worker",
    email: "worker@jammuserve.test",
    role: Role.WORKER,
    region: "Gandhi Nagar"
  },
  {
    name: "JammuServe Customer",
    email: "customer@jammuserve.test",
    role: Role.CUSTOMER,
    region: "Gandhi Nagar"
  }
] as const;

async function main() {
  const passwordHash = hashPassword(demoPassword);

  for (const user of demoUsers) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        region: user.region
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        region: user.region
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (savedUser.role === Role.WORKER) {
      await prisma.workerProfile.upsert({
        where: { userId: savedUser.id },
        update: {
          skills: ["AC Repair", "Electrician"],
          isOnline: true
        },
        create: {
          userId: savedUser.id,
          skills: ["AC Repair", "Electrician"],
          isOnline: true
        }
      });
    }
  }

  console.log("Demo users are ready:");
  for (const user of demoUsers) {
    console.log(`${user.role.padEnd(8)} ${user.email} / ${demoPassword}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
