import { NextResponse } from "next/server";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const requestRecord = await db.query.requests.findFirst({
    where: eq(requests.id, id),
  });

  if (!requestRecord) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ request: requestRecord });
}
