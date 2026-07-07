import { NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { csvText } = await req.json();
    if (!csvText) {
      return NextResponse.json({ error: "CSV data required" }, { status: 400 });
    }

    const lines = csvText.split("\n").filter((l: string) => l.trim() !== "");
    // Header format: Name,Category,Brand,Quantity,Location
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p: string) => p.trim());
      if (parts.length < 4) continue;
      const [name, category, brand, quantity, location] = parts;

      const qtyNum = parseInt(quantity) || 0;

      await db.insert(items).values({
        id: crypto.randomUUID(),
        name,
        category: category.toLowerCase(),
        brand,
        quantity: qtyNum,
        availableQty: qtyNum,
        location: location || "ICT Lab",
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
