import { NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq, like, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let conditions = [];
  if (search) conditions.push(like(items.name, `%${search}%`));
  if (category) conditions.push(eq(items.category, category));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const allItems = await db.select().from(items).where(where).limit(limit).offset(offset);
  return NextResponse.json({ items: allItems });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, category, brand, quantity, location } = await req.json();
  if (!name || !category || !brand || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const qty = parseInt(quantity) || 0;
  await db.insert(items).values({
    id: crypto.randomUUID(),
    name,
    category: category.toLowerCase(),
    brand,
    quantity: qty,
    availableQty: qty,
    location: location || "ICT Lab",
    createdAt: Date.now(),
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, category, brand, quantity, location } = await req.json();
  if (!id || !name || !category || !brand || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await db.query.items.findFirst({ where: eq(items.id, id) });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const diff = parseInt(quantity) - existing.quantity;
  const newAvailableQty = Math.max(0, existing.availableQty + diff);

  await db
    .update(items)
    .set({
      name,
      category: category.toLowerCase(),
      brand,
      quantity: parseInt(quantity),
      availableQty: newAvailableQty,
      location: location || "ICT Lab",
    })
    .where(eq(items.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(items).where(eq(items.id, id));
  return NextResponse.json({ success: true });
}
