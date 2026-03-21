import { redirect } from "next/navigation";
import { getServerSession } from "@/app/src/lib/session";
import ExpenseCsvImportClient from "./ExpenseCsvImportClient";

export default async function ExpenseImportPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <ExpenseCsvImportClient />;
}