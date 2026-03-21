import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";
import { parseExpenseCategory } from "@/lib/constants/ExpenseCategories";

type ExpensePayload = {
  category: string;
  amount: number;
  currency: string;
  description?: string;
  date?: string;
};

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      orderBy: [{ spentAt: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ExpensePayload;

  try {
    body = await request.json();
  } catch (error) {
    console.error("Error parsing expense payload:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsedCategory = parseExpenseCategory(body.category);
  if (!parsedCategory) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const parsedAmount = Number(body.amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "";
  if (!currency) {
    return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
  }

  const description = typeof body.description === "string" && body.description.trim().length > 0 ? body.description.trim() : null;
  if (description && description.length > 300) {
    return NextResponse.json({ error: "Description is too long" }, { status: 400 });
  }

  const spentAt = body.date ? new Date(body.date) : new Date();
  if (Number.isNaN(spentAt.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    // Zapisujemy poprawnie zwalidowany wydatek dla zalogowanego usera.
    const expenseData = await prisma.expense.create({
      data: {
        category: parsedCategory,
        amount: parsedAmount,
        userId: session.user.id,
        currency,
        description,
        spentAt,
      },
    });

    return NextResponse.json({ expenseData }, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
