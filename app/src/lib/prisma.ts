import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const prismaConfig = (() => {
  const parsed = new URL(rawDatabaseUrl);
  const schemaFromUrl = parsed.searchParams.get("schema");

  return {
    connectionString: rawDatabaseUrl,
    schema: schemaFromUrl ?? "public",
  };
})();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: prismaConfig.connectionString,
    }, { schema: prismaConfig.schema }),
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
