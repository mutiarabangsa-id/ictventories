# Task 2 Report: Database Setup with Drizzle & Seed

## Status
✅ Complete

## Commit
feat: setup database schema, drizzle configurations, and seed admin users

## What was done
- Created `src/db/schema.ts` with tables: users, items, borrowings, requests
- Created `src/db/index.ts` with SQLite connection via better-sqlite3 + Drizzle
- Created `drizzle.config.ts` pointing to schema and DB file
- Created `src/db/seed.ts` seeding two admin users: `admin/admin123` and `superadmin/super123` with bcrypt hashed passwords
- Added scripts to `package.json`: `db:generate`, `db:push`, `db:seed`
- Ran `npx drizzle-kit push` successfully
- Ran `npm run db:seed` successfully
- Verified SQLite DB file exists at `data/mbs-inventory.db`

## Test Summary
- `npx drizzle-kit push`: Schema applied successfully
- `npm run db:seed`: Seeding complete, both users created
- `data/mbs-inventory.db`: File exists

## Concerns
None at this time. All steps completed as planned.
