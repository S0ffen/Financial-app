import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";

export async function GET() {
  console.log("HIT /api/expenses GET");
  return NextResponse.json({ message: "GET request received" });
}
type Expense = {
  category: string;
  amount: number;
};
export async function POST(request: Request) {
  let body: Expense;
  const session = await getServerSession();
  console.log("Session:", session);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    body = await request.json();
    //walidacja danych
    if (!body.category || typeof body.category !== "string" || body.category.trim() === "") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (typeof body.amount === "string" || body.amount <= 0) {
      const parsedAmount = Number(body.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || Number.isFinite(parsedAmount) === false) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      body.amount = parsedAmount;
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  //Zwraca się expenseData, które zawiera dane nowo utworzenego rekordu aby nie trzeba było znowu pobierać z bazy danych.
  //W przypadku błędu zwraca się odpowiedni komunikat i status HTTP.
  let expenseData;
  try {
    expenseData = await prisma.expense.create({
      data: {
        category: body.category,
        amount: body.amount,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  console.log("HIT /api/expenses POST", body, expenseData);
  return NextResponse.json({ message: "POST request received", expenseData }, { status: 201 });
}
