import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | {
        salary?: unknown;
        period?: unknown;
        description?: unknown;
      }
    | null;

  const salary = Number(body?.salary);
  const period = new Date(String(body?.period ?? ""));
  // Normalizujemy opis do przycietego stringa, zeby update nie zapisywal pustych spacji.
  const description =
    typeof body?.description === "string" && body.description.trim().length > 0
      ? body.description.trim()
      : null;

  // Walidujemy payload przed update, zeby nie zapisac pustych albo blednych danych.
  if (!Number.isFinite(salary) || salary <= 0) {
    return NextResponse.json({ error: "Invalid salary" }, { status: 400 });
  }

  if (Number.isNaN(period.getTime())) {
    return NextResponse.json({ error: "Invalid period date" }, { status: 400 });
  }

  if (description && description.length > 300) {
    return NextResponse.json({ error: "Description is too long" }, { status: 400 });
  }

  try {
    // Aktualizujemy tylko rekord nalezacy do zalogowanego usera.
    const updatedRecord = await prisma.salaryRecord.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        salary,
        description,
        period,
      },
    });

    if (updatedRecord.count === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating salary record:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const deletedRecord = await prisma.salaryRecord.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (deletedRecord.count === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting salary record:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
