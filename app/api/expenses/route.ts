import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";

export async function GET() {
  console.log("HIT /api/expenses GET");
  const session = await getServerSession();
  console.log("Session:", session);
  return NextResponse.json({ message: "GET request received" });
}

type Expense = {
  category: string;
  amount: number;
  currency: string;
  description?: string;
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

    // walidacja danych
    if (!body.category || typeof body.category !== "string" || body.category.trim() === "") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const parsedAmount = Number(body.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    body.amount = parsedAmount;

    if (!body.currency || typeof body.currency !== "string" || body.currency.trim() === "") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    if (body.description && typeof body.description !== "string") {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let expenseData;
  try {
    expenseData = await prisma.expense.create({
      data: {
        category: body.category,
        amount: body.amount,
        userId: session.user.id,
        currency: body.currency,
        description: body.description,
      },
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  console.log("HIT /api/expenses POST", body, expenseData);
  return NextResponse.json({ message: "POST request received", expenseData }, { status: 201 });
}
