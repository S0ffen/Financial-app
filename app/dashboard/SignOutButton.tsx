"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Sign out failed");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="btn-dark-pill h-10 min-w-[110px] px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing out..." : "Sign Out"}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
