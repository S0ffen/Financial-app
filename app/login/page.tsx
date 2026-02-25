import { redirect } from "next/navigation";
import LoginForm from "@/app/login/LoginForm";
import { getServerSession } from "@/app/src/lib/session";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <LoginForm />
    </main>
  );
}
