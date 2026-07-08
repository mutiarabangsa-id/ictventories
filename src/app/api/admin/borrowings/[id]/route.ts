import { NextResponse } from "next/server";
import { db } from "@/db";
import { borrowings, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
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

  const item = await db.query.items.findFirst({
    where: eq(items.id, borrowing.itemId),
  });

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

    if (item) {
      await db
        .update(items)
        .set({ availableQty: Math.max(0, item.availableQty - borrowing.quantity) })
        .where(eq(items.id, borrowing.itemId));
    }

    await sendEmail({
      to: borrowing.borrowerEmail,
      subject: "Borrowing Approved",
      text: `Hello ${borrowing.borrowerName}, your borrowing of ${item?.name} for ${borrowing.quantity} unit(s) has been approved. Your return unique code: ${uniqueCode}`,
      html: `<p>Hello <strong>${borrowing.borrowerName}</strong>,</p><p>Your borrowing of <strong>${item?.name}</strong> for <strong>${borrowing.quantity}</strong> unit(s) has been approved.</p><p>Your return unique code:</p><h2 style="font-family:monospace;color:#2563eb;letter-spacing:2px;">${uniqueCode}</h2><p>Use this code to return the item in the system.</p>`,
    });

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

    if (item) {
      await db
        .update(items)
        .set({ availableQty: Math.min(item.quantity, item.availableQty + borrowing.quantity) })
        .where(eq(items.id, borrowing.itemId));
    }

    await sendEmail({
      to: borrowing.borrowerEmail,
      subject: "Return Accepted",
      text: `Hello ${borrowing.borrowerName}, your return of ${item?.name} for ${borrowing.quantity} unit(s) has been successfully verified.`,
      html: `<p>Hello <strong>${borrowing.borrowerName}</strong>,</p><p>Your return of <strong>${item?.name}</strong> for <strong>${borrowing.quantity}</strong> unit(s) has been successfully verified. Thank you.</p>`,
    });

    return NextResponse.json({ success: true });
  }

  if (action === "reject_borrow" && borrowing.status === "pending_borrow") {
    await db
      .update(borrowings)
      .set({ status: "rejected" })
      .where(eq(borrowings.id, id));

    await sendEmail({
      to: borrowing.borrowerEmail,
      subject: "Borrowing Rejected",
      text: `Hello ${borrowing.borrowerName}, your borrowing request for ${item?.name} has been rejected by admin.`,
      html: `<p>Hello <strong>${borrowing.borrowerName}</strong>,</p><p>Your borrowing request for <strong>${item?.name}</strong> has been rejected by admin. Please contact the ICT team if you have questions.</p>`,
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
