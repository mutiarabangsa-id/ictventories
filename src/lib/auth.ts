import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SessionUser {
  id: string;
  username: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  try {
    const parts = Buffer.from(token, 'base64').toString('utf8').split(':');
    if (parts.length !== 3) return null;

    const [username, role, id] = parts;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });

    if (!user || user.username !== username || user.role !== role) {
      return null;
    }

    return { id, username, role };
  } catch {
    return null;
  }
}

export function createSessionToken(user: { id: string; username: string; role: string }) {
  const val = `${user.username}:${user.role}:${user.id}`;
  return Buffer.from(val).toString('base64');
}
