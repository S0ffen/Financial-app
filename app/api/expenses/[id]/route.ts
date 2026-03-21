import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";
import { parseExpenseCategory } from "@/lib/constants/ExpenseCategories";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ExpenseUpdatePayload = {
  category?: string;
  amount?: number;
  currency?: string;
  description?: string;
  date?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Expense id is required" }, { status: 400 });
  }

  let body: ExpenseUpdatePayload;

  try {
    body = await request.json();
  } catch (error) {
    console.error("Error parsing expense update payload:", error);
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

  const spentAt = body.date ? new Date(body.date) : null;
  if (!spentAt || Number.isNaN(spentAt.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    // Aktualizujemy tylko rekord nalezacy do aktualnie zalogowanego usera.
    const updatedExpense = await prisma.expense.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        category: parsedCategory,
        amount: parsedAmount,
        currency,
        description,
        spentAt,
      },
    });

    if (updatedExpense.count === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Expense id is required" }, { status: 400 });
  }

  try {
    const deleted = await prisma.expense.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
