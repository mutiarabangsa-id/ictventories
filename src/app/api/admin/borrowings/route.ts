import { NextResponse } from "next/server";
import { db } from "@/db";
import { borrowings, items } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allBorrowings = await db.select().from(borrowings);
  const allItems = await db.select().from(items);

  const enriched = allBorrowings.map((b) => ({
    ...b,
    itemName: allItems.find((i) => i.id === b.itemId)?.name || "Unknown",
  }));

  return NextResponse.json({ borrowings: enriched });
}
