import { NextResponse } from 'next/server';
import { db } from '@/db';
import { borrowings, items } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { uniqueCode, returnImageUrl, action } = await req.json();

    if (!uniqueCode) {
      return NextResponse.json({ error: 'Unique code is required' }, { status: 400 });
    }

    const borrowing = await db.query.borrowings.findFirst({
      where: and(eq(borrowings.uniqueCode, uniqueCode), eq(borrowings.status, 'borrowed')),
    });

    if (!borrowing) {
      return NextResponse.json({ error: 'Tidak ditemukan peminjaman aktif untuk kode ini' }, { status: 404 });
    }

    if (action === 'lookup') {
      const item = await db.query.items.findFirst({
        where: eq(items.id, borrowing.itemId)
      });
      return NextResponse.json({ success: true, borrowing, item });
    }

    if (action === 'submit_return') {
      if (!returnImageUrl) {
        return NextResponse.json({ error: 'Return image is required' }, { status: 400 });
      }

      await db.update(borrowings)
        .set({
          status: 'pending_return',
          returnImageUrl
        })
        .where(eq(borrowings.id, borrowing.id));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
