import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";

type BulkDeletePayload = {
  ids?: string[];
};

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BulkDeletePayload;

  try {
    body = await request.json();
  } catch (error) {
    console.error("Error parsing bulk delete payload:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === "string" && id.trim().length > 0) : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "Select at least one expense." }, { status: 400 });
  }

  try {
    // Hurtowo usuwamy tylko rekordy nalezace do aktualnie zalogowanego usera.
    const deleted = await prisma.expense.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    return NextResponse.json({ deletedCount: deleted.count });
  } catch (error) {
    console.error("Error deleting expenses in bulk:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
