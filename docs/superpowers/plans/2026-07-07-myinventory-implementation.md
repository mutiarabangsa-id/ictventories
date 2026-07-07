# ICT Inventory, Request & Borrowing System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first self-hosted system for inventory, requests, and borrowing at Mutiara Bangsa ICT using Next.js 15, Drizzle ORM, SQLite, and shadcn/ui.

**Architecture:** Monolithic Next.js (App Router) with SQLite local DB. Public routes handle camera upload & barcode-driven flows. Admin routes use custom cookie sessions for role-based actions.

**Tech Stack:** Next.js 15, SQLite (better-sqlite3), Drizzle ORM, bcryptjs, nodemailer, @react-pdf/renderer, Tailwind CSS v4, shadcn/ui, framer-motion, lucide-react.

## Global Constraints
- Target platform: Node.js v20 on Windows (development) and Ubuntu Server 24 LTS (production).
- Database: Local SQLite file at `data/mbs-inventory.db`.
- Uploads directory: `public/uploads/` (git-ignored, serve statically).
- No complex auth libraries. Custom cookie sessions using `jose` or simple JWT/session store.
- Desktop UI for admin, Mobile-first UI for public (/borrow, /return).

---

## Tasks

### Task 1: Bootstrap Next.js & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js` (standard Next.js setup)
- Modify: None (clean setup)
- Test: Build and run the app

**Interfaces:**
- Consumes: None
- Produces: Working Next.js project skeleton with standard dependencies installed.

- [ ] **Step 1: Bootstrap Next.js 15 app**
Initialize the workspace with Next.js 15 template.
Run: `npx create-next-app@15.0.0-rc.0 . --ts --eslint --tailwind --app --src-dir --import-alias "@/*"`

- [ ] **Step 2: Add essential dependencies**
Install database ORM, crypto, mail, PDF, icon, and animation libraries.
Run: `npm install better-sqlite3 drizzle-orm bcryptjs nodemailer @react-pdf/renderer lucide-react framer-motion clsx tailwind-merge canvas-confetti gsap tsparticles tsparticles-slim @tsparticles/react react-spring`
Run: `npm install -D drizzle-kit @types/better-sqlite3 @types/bcryptjs @types/nodemailer @types/canvas-confetti @types/gsap tsx`

- [ ] **Step 3: Run dev server to verify bootstrap**
Run: `npm run dev`
Expected: Server starts on port 3000. Verify by hitting `http://localhost:3000` via curl or checking output.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: bootstrap nextjs project and install dependencies"
```

---

### Task 2: Database Setup with Drizzle & Seed

**Files:**
- Create: `src/db/schema.ts` (Tables: users, items, borrowings, requests)
- Create: `src/db/index.ts` (Database connection)
- Create: `drizzle.config.ts` (Drizzle config)
- Create: `src/db/seed.ts` (Seed default Super Admin & Admin)
- Create: `data/` directory

**Interfaces:**
- Consumes: Database dependencies
- Produces: `db` connection instance, SQLite DB file `data/mbs-inventory.db`, seeded users table with default accounts.

- [ ] **Step 1: Create Drizzle Schema**
Create `src/db/schema.ts`:
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(), // 'super_admin' | 'admin'
  createdAt: integer('created_at').notNull()
});

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'hardware' | 'consumable' | 'tools'
  brand: text('brand').notNull(),
  quantity: integer('quantity').notNull(),
  availableQty: integer('available_qty').notNull(),
  location: text('location').default('ICT Lab').notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at').notNull()
});

export const borrowings = sqliteTable('borrowings', {
  id: text('id').primaryKey(),
  borrowerName: text('borrower_name').notNull(),
  borrowerType: text('borrower_type').notNull(), // 'guru' | 'staff' | 'murid'
  borrowerEmail: text('borrower_email').notNull(),
  borrowerPhone: text('borrower_phone').notNull(),
  itemId: text('item_id').notNull(),
  quantity: integer('quantity').notNull(),
  uniqueCode: text('unique_code').unique().notNull(),
  status: text('status').notNull(), // 'pending_borrow' | 'borrowed' | 'pending_return' | 'returned' | 'rejected'
  borrowImageUrl: text('borrow_image_url').notNull(),
  returnImageUrl: text('return_image_url'),
  borrowedAt: integer('borrowed_at'),
  approvedBorrowBy: text('approved_borrow_by'),
  returnedAt: integer('returned_at'),
  approvedReturnBy: text('approved_return_by'),
  createdAt: integer('created_at').notNull()
});

export const requests = sqliteTable('requests', {
  id: text('id').primaryKey(),
  requestNumber: text('request_number').notNull(),
  supplierName: text('supplier_name').notNull(),
  status: text('status').notNull(), // 'draft' | 'submitted'
  itemsData: text('items_data').notNull(), // JSON string: [{ name: string, qty: number, est_price: number, desc: string }]
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at').notNull()
});
```

- [ ] **Step 2: Create Drizzle Database Connection**
Create `src/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(path.join(dbDir, 'mbs-inventory.db'));
export const db = drizzle(sqlite, { schema });
```

- [ ] **Step 3: Create Drizzle Configuration**
Create `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/mbs-inventory.db',
  },
});
```

- [ ] **Step 4: Create Seed Script**
Create `src/db/seed.ts`:
```typescript
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
```

- [ ] **Step 5: Run Drizzle Migration & Seed**
Add scripts in `package.json`:
`"db:generate": "drizzle-kit generate",`
`"db:push": "drizzle-kit push",`
`"db:seed": "tsx src/db/seed.ts"`

Run: `npm run db:push; if ($?) { npm run db:seed }`
Expected: SQLite database generated at `data/mbs-inventory.db` and output shows seeding success.

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "feat: setup database schema, drizzle configurations, and seed admin users"
```

---

### Task 3: Setup Custom Session Auth & Middleware

**Files:**
- Create: `src/lib/auth.ts` (helper: encrypt/decrypt session token, getSession)
- Create: `src/middleware.ts` (intercept `/admin` routes to ensure admin is authenticated)
- Create: `src/app/api/auth/login/route.ts` (handles login payload)
- Create: `src/app/api/auth/logout/route.ts` (handles logout payload)

**Interfaces:**
- Consumes: `users` table
- Produces: Middleware checking cookie `session_token` and decrypting payload. `/admin` pages require valid session token, redirecting to `/admin/login` otherwise.

- [ ] **Step 1: Write Custom Session Token Helpers**
Create `src/lib/auth.ts`:
```typescript
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SessionUser {
  id: string;
  username: string;
  role: string;
}

// Simple cookie session token strategy
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  try {
    // Decrypting local simple string (username:role:id) or token
    const parts = Buffer.from(token, 'base64').toString('utf8').split(':');
    if (parts.length !== 3) return null;

    const [username, role, id] = parts;
    
    // Validate in DB to be safe
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
```

- [ ] **Step 2: Create Auth API Routes**
Create `src/app/api/auth/login/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = createSessionToken({ id: user.id, username: user.username, role: user.role });
    const response = NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
    
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

Create `src/app/api/auth/logout/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session_token', '', { maxAge: 0 });
  return response;
}
```

- [ ] **Step 3: Create Middleware**
Create `src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except login page
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If already logged in, redirect /admin/login to /admin dashboard
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

- [ ] **Step 4: Verify Auth Flow**
Create a temporary page `src/app/admin/page.tsx` that prints welcome to admin. Let's make it hit the dashboard UI later.
Run: `npm run dev` and navigate to `http://localhost:3000/admin`.
Expected: Automatically redirected to `/admin/login`.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: implement custom auth middleware, login/logout routes"
```

---

### Task 4: Public Mobile-First Pages - /borrow and /return

**Files:**
- Create: `src/app/page.tsx` (redirects to /borrow)
- Create: `src/app/borrow/page.tsx` (item choosing list, borrower details, file upload/selfie, submit)
- Create: `src/app/borrow/success/page.tsx` (displays success info)
- Create: `src/app/return/page.tsx` (accept code, display details, camera file upload, submit return)
- Create: `src/app/return/success/page.tsx` (displays success return info)
- Create: `src/app/api/borrow/route.ts` (API to process borrowings)
- Create: `src/app/api/return/route.ts` (API to process returns)
- Create: `src/app/api/upload/route.ts` (API to handle base64 image uploads to public/uploads/)

**Interfaces:**
- Consumes: `items` table, `borrowings` table
- Produces: Public HTML client flows for users to borrow and return.

- [ ] **Step 1: Write Root Page Redirect**
Create `src/app/page.tsx`:
```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/borrow');
}
```

- [ ] **Step 2: Write Upload API Route**
Create `src/app/api/upload/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // base64 string
    if (!image) {
      return NextResponse.json({ error: 'Image data required' }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${crypto.randomUUID()}.jpg`;
    const filepath = path.join(uploadDir, filename);
    
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Write Public Borrow Page**
Create API route `src/app/api/borrow/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { borrowings, items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET() {
  // Return items for list choosing
  const allItems = await db.select().from(items);
  return NextResponse.json({ items: allItems });
}

export async function POST(req: Request) {
  try {
    const { borrowerName, borrowerType, borrowerEmail, borrowerPhone, itemId, quantity, borrowImageUrl } = await req.json();
    
    if (!borrowerName || !borrowerType || !borrowerEmail || !borrowerPhone || !itemId || !quantity || !borrowImageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check item stock
    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId)
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.availableQty < quantity) {
      return NextResponse.json({ error: 'Insuficient stock' }, { status: 400 });
    }

    // Generate unique code
    const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 character code

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
```

Create view `src/app/borrow/page.tsx` containing selecting list of items, details input, photo selfie/device taking using raw `<input type="file" accept="image/*" capture="user">` or Canvas snapshot, and submitting. Add Framer Motion transitions.

- [ ] **Step 4: Create Success Page**
Create `src/app/borrow/success/page.tsx` displaying success message and stating "Admin will review and approve. Please wait for email confirmation."

- [ ] **Step 5: Write Return Page**
Create API route `src/app/api/return/route.ts`:
```typescript
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
      return NextResponse.json({ error: 'No active borrowing record found for this code' }, { status: 404 });
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
```

Create view `src/app/return/page.tsx` which has Step 1: Input Code -> Step 2: Display Details (Item name, Quantity, Borrower info) -> Step 3: Take Return Photo -> Step 4: Submit.
Create view `src/app/return/success/page.tsx` displaying "Return request submitted. Admin will verify shortly."

- [ ] **Step 6: Verify Page Flow**
Ensure `/borrow` and `/return` forms work end to end by doing dry requests.

- [ ] **Step 7: Commit**
```bash
git add .
git commit -m "feat: create public pages for borrowing and returning with camera handling"
```

---

### Task 5: Admin Login UI and Sidebar

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: Session cookies, Next.js Middleware
- Produces: Secure layout wrapper with sidebar navigation and admin identity header.

- [ ] **Step 1: Implement Login UI**
Create a clean modern Google-like login card at `src/app/admin/login/page.tsx` that sends credentials to `/api/auth/login` and redirects to `/admin`.

- [ ] **Step 2: Implement Layout with Sidebar**
Create `src/app/admin/layout.tsx` containing:
- Responsive navigation sidebar (Dashboard, Inventory, Borrowings, Requests, Settings)
- Logout button hitting `/api/auth/logout`
- Custom branding ("Mutiara Bangsa ICT Admin")

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: add admin login UI and dashboard sidebar layout"
```

---

### Task 6: Admin Dashboard & Settings (Users & QR generation)

**Files:**
- Create: `src/app/admin/page.tsx` (Dashboard home)
- Create: `src/app/admin/settings/page.tsx` (Super Admin admin management & QR print card)
- Create: `src/app/api/admin/users/route.ts` (Super Admin user administration API)
- Create: `src/app/api/admin/stats/route.ts` (Dashboard stats API)

**Interfaces:**
- Consumes: Tables `users`, `items`, `borrowings`
- Produces: Manageable user roles list, dashboard quick stats counts, pending requests approvals.

- [ ] **Step 1: Dashboard Dashboard Stats API**
Create `src/app/api/admin/stats/route.ts` returning counts of total items, borrowed items, pending borrow requests, pending return requests.

- [ ] **Step 2: Dashboard UI**
Create `src/app/admin/page.tsx` with:
- Stats cards with subtle entrance animations (Framer Motion / GSAP)
- Sections for "Pending Borrow Approvals" and "Pending Return Approvals"
- Accept/Reject buttons triggering API updates

- [ ] **Step 3: Admin User Management API**
Create `src/app/api/admin/users/route.ts` checking current session. If `session.role === 'super_admin'`, support GET (all users), POST (create admin), PUT (update admin), DELETE (delete admin).

- [ ] **Step 4: Settings Page UI**
Create `src/app/admin/settings/page.tsx` with:
- QR code print widget containing URL pointing to `http://<server-ip>:3000/borrow`
- Admin accounts list with dynamic modal to add/edit/delete (restricted to `super_admin`)

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: implement dashboard views, admin stats, settings user management"
```

---

### Task 7: Admin Inventory CRUD and CSV/Excel Import

**Files:**
- Create: `src/app/admin/inventory/page.tsx`
- Create: `src/app/api/admin/inventory/route.ts`
- Create: `src/app/api/admin/inventory/import/route.ts`

**Interfaces:**
- Consumes: `items` table
- Produces: Complete inventory control list, add/edit/delete inline or modal forms, parse CSV import to batch create/update database.

- [ ] **Step 1: Create Inventory API**
Create `src/app/api/admin/inventory/route.ts` handling:
- GET: list all inventory items with pagination, category filter, name search
- POST: create item
- PUT: update item
- DELETE: delete item

- [ ] **Step 2: Create CSV Import API**
Create `src/app/api/admin/inventory/import/route.ts` handling CSV/Excel text parsing:
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { items } from '@/db/schema';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { csvText } = await req.json();
    if (!csvText) {
      return NextResponse.json({ error: 'CSV data required' }, { status: 400 });
    }

    const lines = csvText.split('\n').filter((l: string) => l.trim() !== '');
    // Header format: Name,Category,Brand,Quantity,Location
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p: string) => p.trim());
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
        location: location || 'ICT Lab',
        createdAt: Date.now()
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Inventory Page UI**
Create `src/app/admin/inventory/page.tsx` using shadcn/ui Tables. Add modals for:
- Manual adding/editing item
- File chooser to import CSV data
- Export to CSV button

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: implement inventory management UI and CSV batch import"
```

---

### Task 8: Borrowings Approval & Email Notifications

**Files:**
- Create: `src/app/admin/borrowings/page.tsx`
- Create: `src/app/api/admin/borrowings/[id]/route.ts`
- Create: `src/lib/email.ts`

**Interfaces:**
- Consumes: `borrowings` table, `nodemailer` config
- Produces: API routes to approve/reject. When borrow approved, generate and send email with unique code. When return approved, update inventory `availableQty` stock increment and email confirmation.

- [ ] **Step 1: Write Nodemailer Service**
Create `src/lib/email.ts`:
```typescript
import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  // Simple SMTP configuration (credentials configured in .env)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"MBS ICT System" <${process.env.SMTP_FROM || 'ict@mutiarabangsa.sch.id'}>`,
    to,
    subject,
    text,
    html,
  });
}
```

- [ ] **Step 2: Borrowing Status Update API**
Create `src/app/api/admin/borrowings/[id]/route.ts` handling POST status changes.
- Approve Borrow: Set status to `borrowed`, set `borrowedAt` to current timestamp, decrement item stock `availableQty`, send email to borrower with their `uniqueCode`.
- Reject Borrow: Set status to `rejected`, send email notifying reason.
- Approve Return: Set status to `returned`, set `returnedAt` to current timestamp, increment item stock `availableQty`, send email confirmation.

- [ ] **Step 3: Borrowings Dashboard UI**
Create view `src/app/admin/borrowings/page.tsx` displaying history of all borrowings, search by borrower name/code, filter by status. Detail modals displaying uploaded photo (borrow or return).

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: implement admin borrowings approval workflow and email dispatcher"
```

---

### Task 9: Admin Request Pengadaan (Landscape A4 PDF Print)

**Files:**
- Create: `src/app/admin/requests/page.tsx`
- Create: `src/app/admin/requests/new/page.tsx`
- Create: `src/app/admin/requests/[id]/page.tsx`
- Create: `src/app/api/admin/requests/route.ts`

**Interfaces:**
- Consumes: `requests` table
- Produces: PDF Generator component for invoice, request creations and listings.

- [ ] **Step 1: Create Requests API**
Create `src/app/api/admin/requests/route.ts`:
- GET: list all requests
- POST: create a request with details (generates sequential number REQ-YYYYMMDD-XXX)

- [ ] **Step 2: Create Request Form UI**
Create `src/app/admin/requests/new/page.tsx` containing supplier name, dynamically addable row inputs (Item Name, Qty, Estimated Price, Description), Save as Draft, and Submit actions.

- [ ] **Step 3: Create Landscape A4 Print UI**
Create `src/app/admin/requests/[id]/page.tsx`. Integrate `@react-pdf/renderer` or simple print stylesheets (`@media print`) styled correctly to A4 landscape specs, creating a professional header "MUTIARA BANGSA ICT - SURAT PERMINTAAN BARANG".

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: implement procurement requests and landscape A4 printable template"
```

---

### Task 10: Complete Styling, Animation Polish & Final Verification

**Files:**
- Modify: `src/app/layout.tsx` (add custom styling / TS-Particles setup)
- Modify: `src/app/borrow/page.tsx`, `src/app/return/page.tsx` (GSAP/AOS/Framer Motion integration)
- Create: `README.md` (deployment guide, PM2 instructions, nginx settings)

**Interfaces:**
- Consumes: Configs and environment files
- Produces: Final fully animated visual polish.

- [ ] **Step 1: Add Animations**
Add Framer Motion layouts on public forms transitions, confetti blast on success using `canvas-confetti`.

- [ ] **Step 2: Setup .env.example**
Create `.env.example` file:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=test@gmail.com
SMTP_PASS=password
SMTP_FROM=ict@mutiarabangsa.sch.id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3: Final Verification Test**
Run a complete cycle: add item -> go to /borrow -> submit borrow -> go to /admin -> approve -> receive unique code -> go to /return -> submit return -> approve return.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: polish animations, configure environment samples, and complete final testing"
```
