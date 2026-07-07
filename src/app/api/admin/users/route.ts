import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allUsers = await db.select().from(users);
  return NextResponse.json({ users: allUsers.map((u) => ({ id: u.id, username: u.username, email: u.email, role: u.role })) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { username, password, email, role } = await req.json();
  if (!username || !password || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    id: crypto.randomUUID(),
    username,
    password: hashedPassword,
    email,
    role: role || "admin",
    createdAt: Date.now(),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}
