import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function seed() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const superPassword = await bcrypt.hash('super123', 10);

  const testUsers = [
    {
      id: crypto.randomUUID(),
      username: 'admin',
      password: adminPassword,
      email: 'admin@mutiarabangsa.sch.id',
      role: 'admin',
      createdAt: Date.now()
    },
    {
      id: crypto.randomUUID(),
      username: 'superadmin',
      password: superPassword,
      email: 'superadmin@mutiarabangsa.sch.id',
      role: 'super_admin',
      createdAt: Date.now()
    }
  ];

  for (const user of testUsers) {
    await db.insert(users).values(user).onConflictDoNothing();
  }
  console.log('Seeding complete. Default admin/admin123 and superadmin/super123 created.');
}

seed().catch(console.error);
