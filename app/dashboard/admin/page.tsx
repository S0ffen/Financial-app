import { redirect } from "next/navigation";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import AdminUsersPanel, { type AdminUserRow } from "@/app/dashboard/components/AdminUsersPanel";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rows: AdminUserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto flex w-full flex-col gap-4 px-4 py-6 lg:w-[75%]">
      <h1 className="text-2xl font-semibold text-zinc-100">Admin Panel</h1>
      <p className="text-sm text-zinc-400">
        Manage users and reset passwords. This view is available only for administrators.
      </p>
      <AdminUsersPanel users={rows} />
    </main>
  );
}
