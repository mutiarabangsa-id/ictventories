import { NextResponse } from "next/server";
import { db } from "@/db";
import { borrowings, items } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allItems = await db.select().from(items);
    const allBorrowings = await db
      .select()
      .from(borrowings)
      .orderBy(desc(borrowings.createdAt))
      .limit(10); // show top 10 recent borrowings

    const totalItems = allItems.reduce((sum, i) => sum + i.quantity, 0);
    const onLoan = allItems.reduce((sum, i) => sum + (i.quantity - i.availableQty), 0);

    const enrichedBorrowings = allBorrowings.map((b) => ({
      id: b.id,
      borrowerName: b.borrowerName,
      borrowerType: b.borrowerType,
      itemName: allItems.find((i) => i.id === b.itemId)?.name || "Unknown",
      status: b.status,
      createdAt: b.createdAt,
    }));

    return NextResponse.json({
      stats: {
        totalItems,
        onLoan,
      },
      borrowings: enrichedBorrowings,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
