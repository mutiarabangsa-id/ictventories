import { NextResponse } from "next/server";
import { db } from "@/db";
import { borrowings, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const borrowing = await db.query.borrowings.findFirst({
    where: eq(borrowings.id, id),
  });

  if (!borrowing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "approve_borrow" && borrowing.status === "pending_borrow") {
    const uniqueCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    await db
      .update(borrowings)
      .set({
        status: "borrowed",
        uniqueCode,
        borrowedAt: Date.now(),
        approvedBorrowBy: session.id,
      })
      .where(eq(borrowings.id, id));

    // Decrement availableQty
    const item = await db.query.items.findFirst({
      where: eq(items.id, borrowing.itemId),
    });
    if (item) {
      await db
        .update(items)
        .set({ availableQty: Math.max(0, item.availableQty - borrowing.quantity) })
        .where(eq(items.id, borrowing.itemId));
    }

    return NextResponse.json({ success: true, uniqueCode });
  }

  if (action === "approve_return" && borrowing.status === "pending_return") {
    await db
      .update(borrowings)
      .set({
        status: "returned",
        returnedAt: Date.now(),
        approvedReturnBy: session.id,
      })
      .where(eq(borrowings.id, id));

    // Increment availableQty
    const item = await db.query.items.findFirst({
      where: eq(items.id, borrowing.itemId),
    });
    if (item) {
      await db
        .update(items)
        .set({ availableQty: Math.min(item.quantity, item.availableQty + borrowing.quantity) })
        .where(eq(items.id, borrowing.itemId));
    }

    return NextResponse.json({ success: true });
  }

  if (action === "reject_borrow" && borrowing.status === "pending_borrow") {
    await db
      .update(borrowings)
      .set({ status: "rejected" })
      .where(eq(borrowings.id, id));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
