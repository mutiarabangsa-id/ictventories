import { NextResponse } from 'next/server';
import { db } from '@/db';
import { borrowings, items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET() {
  const allItems = await db.select().from(items);
  return NextResponse.json({ items: allItems });
}

export async function POST(req: Request) {
  try {
    const { borrowerName, borrowerType, borrowerEmail, borrowerPhone, itemId, quantity, borrowImageUrl } = await req.json();

    if (!borrowerName || !borrowerType || !borrowerEmail || !borrowerPhone || !itemId || !quantity || !borrowImageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId)
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.availableQty < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    await db.insert(borrowings).values({
      id: crypto.randomUUID(),
      borrowerName,
      borrowerType,
      borrowerEmail,
      borrowerPhone,
      itemId,
      quantity: parseInt(quantity),
      uniqueCode,
      status: 'pending_borrow',
      borrowImageUrl,
      createdAt: Date.now()
    });

    return NextResponse.json({ success: true, uniqueCode });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
