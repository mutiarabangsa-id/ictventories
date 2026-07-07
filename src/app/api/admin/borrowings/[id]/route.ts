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
      subject: "Peminjaman Barang Disetujui",
      text: `Halo ${borrowing.borrowerName}, peminjaman ${item?.name} sebanyak ${borrowing.quantity} unit telah disetujui. Kode unik pengembalian Anda: ${uniqueCode}`,
      html: `<p>Halo <strong>${borrowing.borrowerName}</strong>,</p><p>Peminjaman <strong>${item?.name}</strong> sebanyak <strong>${borrowing.quantity}</strong> unit telah disetujui.</p><p>Kode unik pengembalian Anda:</p><h2 style="font-family:monospace;color:#2563eb;letter-spacing:2px;">${uniqueCode}</h2><p>Gunakan kode ini untuk mengembalikan barang di sistem.</p>`,
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
      subject: "Pengembalian Barang Diterima",
      text: `Halo ${borrowing.borrowerName}, pengembalian ${item?.name} sebanyak ${borrowing.quantity} unit telah sukses diverifikasi.`,
      html: `<p>Halo <strong>${borrowing.borrowerName}</strong>,</p><p>Pengembalian <strong>${item?.name}</strong> sebanyak <strong>${borrowing.quantity}</strong> unit telah sukses diverifikasi. Terima kasih.</p>`,
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
      subject: "Peminjaman Barang Ditolak",
      text: `Halo ${borrowing.borrowerName}, pengajuan peminjaman ${item?.name} ditolak oleh admin.`,
      html: `<p>Halo <strong>${borrowing.borrowerName}</strong>,</p><p>Pengajuan peminjaman <strong>${item?.name}</strong> Anda ditolak oleh admin. Silakan hubungi tim ICT jika ada pertanyaan.</p>`,
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
