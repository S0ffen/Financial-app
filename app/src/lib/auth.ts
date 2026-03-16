import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, username } from "better-auth/plugins";
import { prisma } from "@/app/src/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies(), username(), admin()],
  emailAndPassword: {
    enabled: true,
  },
});

type GlobalForAdminBootstrap = typeof globalThis & {
  __adminBootstrapPromise?: Promise<void>;
};

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();
const adminName = process.env.ADMIN_NAME?.trim() || "System Admin";

async function bootstrapAdminUser() {
  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });

  if (!existingUser) {
    try {
      // Create admin account from env only once (or when missing in DB).
      await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("already exists")) {
        throw error;
      }
    }
  }

  // Always enforce admin role for env admin account.
  await prisma.user.updateMany({
    where: {
      email: adminEmail,
      role: { not: "admin" },
    },
    data: {
      role: "admin",
      emailVerified: true,
    },
  });
}

const globalForAdminBootstrap = globalThis as GlobalForAdminBootstrap;

if (!globalForAdminBootstrap.__adminBootstrapPromise) {
  globalForAdminBootstrap.__adminBootstrapPromise = bootstrapAdminUser().catch(
    (error) => {
      console.error("Failed to bootstrap admin user:", error);
    },
  );
}

void globalForAdminBootstrap.__adminBootstrapPromise;
