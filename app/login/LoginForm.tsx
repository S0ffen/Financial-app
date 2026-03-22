"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type AuthMode = "sign-in" | "sign-up";

type BetterAuthErrorPayload = {
  code?: string;
  message?: string;
};

// Zamieniamy surowe bledy Better Auth na krotkie komunikaty przyjazne dla usera.
function mapAuthError(payload: BetterAuthErrorPayload | null, mode: AuthMode): string {
  if (!payload) {
    return mode === "sign-up" ? "Could not create account." : "Could not sign in.";
  }

  if (payload.code === "INVALID_USERNAME_OR_PASSWORD") {
    return "Invalid username or password.";
  }

  if (payload.code === "USER_ALREADY_EXISTS") {
    return "User with this email or username already exists.";
  }

  return payload.message || (mode === "sign-up" ? "Could not create account." : "Could not sign in.");
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("test");
  const [username, setUsername] = useState("test");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("test1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "sign-up" ? "/api/auth/sign-up/email" : "/api/auth/sign-in/username";

      // Signup dalej zapisuje email, ale dodajemy username jako glowny login usera.
      const payload =
        mode === "sign-up"
          ? { name, email, password, username, displayUsername: username }
          : { username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as BetterAuthErrorPayload | null;
        const message = mapAuthError(payload, mode);
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(mode === "sign-up" ? "Account created." : "Signed in successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full rounded-lg border p-6 bg-white" onSubmit={handleSubmit}>
      <div className="mb-5 grid grid-cols-2 rounded border p-1">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError("");
          }}
          className={`rounded px-3 py-2 text-sm ${mode === "sign-in" ? "bg-black text-white" : ""}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError("");
          }}
          className={`rounded px-3 py-2 text-sm ${mode === "sign-up" ? "bg-black text-white" : ""}`}
        >
          Sign Up
        </button>
      </div>

      <h1 className="mb-4 text-2xl font-semibold">
        {mode === "sign-up" ? "Create Account" : "Login"}
      </h1>

      {mode === "sign-up" ? (
        <label className="mb-3 grid gap-1">
          <span className="text-sm">Name</span>
          <input
            className="rounded border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      ) : null}

      <label className="mb-3 grid gap-1">
        <span className="text-sm">Username</span>
        <input
          className="rounded border px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>

      {mode === "sign-up" ? (
        <label className="mb-3 grid gap-1">
          <span className="text-sm">Email</span>
          <input
            type="email"
            className="rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      ) : null}

      <label className="mb-4 grid gap-1">
        <span className="text-sm">Password</span>
        <input
          type="password"
          className="rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "sign-up" ? "Create Account" : "Sign In"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
