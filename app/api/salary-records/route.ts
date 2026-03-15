import { NextResponse } from "next/server";
import { getServerSession } from "@/app/src/lib/session";
import { prisma } from "@/app/src/lib/prisma";

type SalaryRecordPayload = {
  salary: number;
  minimumWage: number;
  period: string;
  description?: string;
};

export async function GET() {
  const session = await getServerSession();

  // Endpoint jest chroniony - tylko zalogowany user moze pobrac swoje rekordy.
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const salaryRecords = await prisma.salaryRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { period: "desc" },
    });

    // Konwersja danych do prostego JSON pod front/chart.
    const normalizedRecords = salaryRecords.map((record) => ({
      id: record.id,
      salary: Number(record.salary),
      minimumWage: Number(record.minimumWage),
      description: record.description,
      period: record.period ? record.period.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
    }));

    return NextResponse.json({ salaryRecords: normalizedRecords });
  } catch (error) {
    console.error("Error fetching salary records:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  // Endpoint jest chroniony - tylko zalogowany user moze dodac rekord.
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SalaryRecordPayload;

  try {
    // Parsowanie JSON z request body.
    body = await request.json();
  } catch (error) {
    console.error("Error parsing salary payload:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Normalizacja danych do typow, na ktorych operujemy dalej.
  const salary = Number(body.salary);
  const minimumWage = Number(body.minimumWage);
  const period = new Date(body.period);
  // Normalizujemy opis do przycietego stringa, zeby nie zapisywac samych spacji.
  const description =
    typeof body.description === "string" && body.description.trim().length > 0
      ? body.description.trim()
      : null;

  // Walidacja danych biznesowych.
  if (!Number.isFinite(salary) || salary <= 0) {
    return NextResponse.json({ error: "Invalid salary" }, { status: 400 });
  }

  if (!Number.isFinite(minimumWage) || minimumWage <= 0) {
    return NextResponse.json({ error: "Invalid minimum wage" }, { status: 400 });
  }

  if (Number.isNaN(period.getTime())) {
    return NextResponse.json({ error: "Invalid period date" }, { status: 400 });
  }

  if (description && description.length > 300) {
    return NextResponse.json({ error: "Description is too long" }, { status: 400 });
  }

  try {
    // Zapis rekordu powiazanego z aktualnym userem.
    const salaryRecord = await prisma.salaryRecord.create({
      data: {
        salary,
        minimumWage,
        description,
        period,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        salaryRecord: {
          ...salaryRecord,
          salary: Number(salaryRecord.salary),
          minimumWage: Number(salaryRecord.minimumWage),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating salary record:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
