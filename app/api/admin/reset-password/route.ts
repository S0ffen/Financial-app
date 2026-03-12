import { NextResponse } from "next/server";
import { auth } from "@/app/src/lib/auth";
import { prisma } from "@/app/src/lib/prisma";

type ResetPasswordBody = {
  userId?: string;
  email?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Only admin can reset passwords for other users.
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as ResetPasswordBody;
    const newPassword = body.newPassword?.trim();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "newPassword must have at least 8 characters" },
        { status: 400 },
      );
    }

    let targetUserId = body.userId?.trim();
    const targetEmail = body.email?.trim().toLowerCase();

    if (!targetUserId && targetEmail) {
      const user = await prisma.user.findUnique({
        where: { email: targetEmail },
        select: { id: true },
      });
      targetUserId = user?.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Provide userId or email" },
        { status: 400 },
      );
    }

    // Better Auth admin endpoint updates password hash safely.
    const result = await auth.api.setUserPassword({
      headers: request.headers,
      body: {
        userId: targetUserId,
        newPassword,
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Admin password reset failed:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
