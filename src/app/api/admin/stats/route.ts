import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, borrowings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allItems = await db.select().from(items);
  const allBorrowings = await db.select().from(borrowings);

  return NextResponse.json({
    totalItems: allItems.reduce((sum, i) => sum + i.quantity, 0),
    onLoan: allItems.reduce((sum, i) => sum + (i.quantity - i.availableQty), 0),
    pendingBorrow: allBorrowings.filter((b) => b.status === "pending_borrow").length,
    pendingReturn: allBorrowings.filter((b) => b.status === "pending_return").length,
  });
}
