import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
