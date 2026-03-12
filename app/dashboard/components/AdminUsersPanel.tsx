"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
};

type AdminUsersPanelProps = {
  users: AdminUserRow[];
};

export default function AdminUsersPanel({ users }: AdminUsersPanelProps) {
  const [passwordByUserId, setPasswordByUserId] = useState<Record<string, string>>({});
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email)),
    [users],
  );

  async function handleResetPassword(userId: string, email: string) {
    const newPassword = (passwordByUserId[userId] ?? "").trim();
    if (newPassword.length < 8) {
      setErrorMessage(`Password for ${email} must have at least 8 characters.`);
      setStatusMessage("");
      return;
    }

    setLoadingUserId(userId);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });

      const result = (await response.json()) as { error?: string; status?: boolean };
      if (!response.ok || result.status !== true) {
        setErrorMessage(result.error ?? `Failed to reset password for ${email}.`);
        return;
      }

      setPasswordByUserId((prev) => ({ ...prev, [userId]: "" }));
      setStatusMessage(`Password reset for ${email}.`);
    } catch {
      setErrorMessage(`Request failed while resetting password for ${email}.`);
    } finally {
      setLoadingUserId(null);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-zinc-100">Users</h2>
        <p className="text-sm text-zinc-400">Reset passwords directly for selected accounts.</p>
      </div>

      {statusMessage ? (
        <p className="mb-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-zinc-900/80 text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Role</th>
              <th className="px-3 py-2 text-left font-medium">Verified</th>
              <th className="px-3 py-2 text-left font-medium">Created</th>
              <th className="px-3 py-2 text-left font-medium">New password</th>
              <th className="px-3 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sortedUsers.map((user) => (
              <tr key={user.id} className="text-zinc-200">
                <td className="px-3 py-2">{user.name}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">
                  <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs">
                    {user.role}
                  </span>
                </td>
                <td className="px-3 py-2">{user.emailVerified ? "Yes" : "No"}</td>
                <td className="px-3 py-2 text-zinc-400">
                  {new Date(user.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="password"
                    placeholder="Min 8 chars"
                    value={passwordByUserId[user.id] ?? ""}
                    onChange={(event) =>
                      setPasswordByUserId((prev) => ({
                        ...prev,
                        [user.id]: event.target.value,
                      }))
                    }
                    className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                    disabled={loadingUserId === user.id}
                    onClick={() => handleResetPassword(user.id, user.email)}
                  >
                    {loadingUserId === user.id ? "Resetting..." : "Reset password"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
