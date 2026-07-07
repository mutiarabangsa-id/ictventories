import { NextResponse } from "next/server";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allRequests = await db.select().from(requests).orderBy(desc(requests.createdAt));
  return NextResponse.json({ requests: allRequests });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supplierName, itemsData, status } = await req.json();
  if (!supplierName || !itemsData) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  const requestNumber = `REQ-${dateStr}-${random}`;

  await db.insert(requests).values({
    id: crypto.randomUUID(),
    requestNumber,
    supplierName,
    status: status || "draft",
    itemsData: typeof itemsData === "string" ? itemsData : JSON.stringify(itemsData),
    createdBy: session.id,
    createdAt: Date.now(),
  });

  return NextResponse.json({ success: true, requestNumber });
}
