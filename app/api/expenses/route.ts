import { NextResponse } from "next/server";

export async function GET() {
  console.log("HIT /api/expenses GET");
  return NextResponse.json({ message: "GET request received" });
}

export async function POST(request: Request) {
  let body: unknown = null;

  try {
    body = await request.json();
  } catch {
    // Keep body as null for empty/non-json requests.
  }

  console.log("HIT /api/expenses POST", body);
  return NextResponse.json({ message: "POST request received", body });
}
