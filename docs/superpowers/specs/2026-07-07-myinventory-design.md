# ICT Inventory, Request & Borrowing System — Design Spec

## Overview
Sistem self-hosted untuk mengelola inventaris ICT (barang, alat, consumable), permintaan pengadaan barang, dan peminjaman barang di lingkungan sekolah Mutiara Bangsa. Didesain mobile-first, modern UI (shadcn/ui), berjalan di PC Server Ubuntu 24.04 LTS.

**User roles:**
- **Super Admin** — manage admin lain, full akses
- **Admin** — manage inventory, validasi peminjaman & pengembalian, request pengadaan
- **Publik (guru/staf/murid)** — tidak perlu login, akses via QR code untuk pinjam/kembalikan barang

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- shadcn/ui + Tailwind CSS v4
- Animation: Framer Motion, GSAP, AOS, TS-Particles, React-Spring
- SQLite via better-sqlite3 + Drizzle ORM
- bcryptjs (auth), nodemailer (email)
- multer / raw body (foto upload)
- @react-pdf/renderer (PDF invoice, landscape A4)
- PM2 (production process manager on Ubuntu)

**Development:** Windows (localhost), Production: Ubuntu Server 24 LTS.

---

## Data Schema

### users
| Column        | Type     | Notes                               |
|---------------|----------|-------------------------------------|
| id            | TEXT PK  | UUID                                |
| username      | TEXT     | unique                              |
| password      | TEXT     | bcrypt hash                         |
| email         | TEXT     |                                     |
| role          | TEXT     | 'super_admin' \| 'admin'            |
| created_at    | TIMESTAMP|                                     |

### items
| Column        | Type     | Notes                               |
|---------------|----------|-------------------------------------|
| id            | TEXT PK  | UUID                                |
| name          | TEXT     |                                     |
| category      | TEXT     | 'hardware' \| 'consumable' \| 'tools'|
| brand         | TEXT     |                                     |
| quantity      | INTEGER  | total stock                         |
| available_qty | INTEGER  | current available stock             |
| location      | TEXT     | default: 'ICT Lab'                  |
| image_url     | TEXT     | optional                            |
| created_at    | TIMESTAMP|                                     |

### borrowings
| Column                | Type     | Notes                               |
|-----------------------|----------|-------------------------------------|
| id                    | TEXT PK  | UUID                                |
| borrower_name         | TEXT     |                                     |
| borrower_type         | TEXT     | 'guru' \| 'staff' \| 'murid'        |
| borrower_email        | TEXT     |                                     |
| borrower_phone        | TEXT     |                                     |
| item_id               | TEXT FK  | → items.id                          |
| quantity              | INTEGER  |                                     |
| unique_code           | TEXT     | 6-digit random code, unique         |
| status                | TEXT     | 'pending_borrow' \| 'borrowed' \| 'pending_return' \| 'returned' \| 'rejected' |
| borrow_image_url      | TEXT     | selfie/barang saat pinjam           |
| return_image_url      | TEXT     | selfie/barang saat kembali          |
| borrowed_at           | TIMESTAMP| null until approved                 |
| approved_borrow_by    | TEXT FK  | → users.id                          |
| returned_at           | TIMESTAMP| null until approved return          |
| approved_return_by    | TEXT FK  | → users.id                          |
| created_at            | TIMESTAMP|                                     |

### requests
| Column         | Type     | Notes                                |
|----------------|----------|--------------------------------------|
| id             | TEXT PK  | UUID                                 |
| request_number | TEXT     | REQ-YYYYMMDD-XXX format              |
| supplier_name  | TEXT     |                                      |
| status         | TEXT     | 'draft' \| 'submitted'               |
| items_data     | TEXT     | JSON: [{ name, qty, est_price, desc }]|
| created_by     | TEXT FK  | → users.id                           |
| created_at     | TIMESTAMP|                                      |

---

## User Flows

### A. Pinjam Barang (Publik)
1. Scan QR code → /borrow
2. Pilih barang dari list (search + filter by category)
3. Isi form: nama, pilih (guru/staf/murid), email, no WA
4. Upload foto barang / selfie pegang barang (via kamera HP)
5. Submit → status: `pending_borrow`
6. Halaman sukses: "Menunggu persetujuan admin. Kode unik akan dikirim via email."

### B. Validasi Pinjam (Admin)
1. Login ke /admin
2. Dashboard → notifikasi "Peminjaman Pending"
3. Review foto, data peminjam, barang
4. Approve → status: `borrowed`, unique_code generated, email dikirim
5. Reject → status: `rejected`, email notifikasi penolakan

### C. Kembalikan Barang (Publik)
1. Scan QR code → /return
2. Input kode unik
3. Jika benar → data peminjam & barang muncul
4. Upload foto barang / selfie
5. Submit → status: `pending_return`

### D. Validasi Pengembalian (Admin)
1. Dashboard → notifikasi "Pengembalian Pending"
2. Review foto pengembalian
3. Approve → status: `returned`, stock dipulihkan

### E. Request Pengadaan (Admin)
1. Admin klik "Buat Request"
2. Isi: nama supplier, list barang (nama, qty, harga est, keterangan)
3. Save draft atau Submit
4. Print → PDF landscape A4 invoice-style

---

## Navigation & Page Structure

### Public Pages
| Path            | Fungsi                                              |
|-----------------|-----------------------------------------------------|
| /               | Redirect ke /borrow                                 |
| /borrow         | Pilih barang → isi data → foto → submit             |
| /borrow/success | Halaman sukses, muncul nomor request                |
| /return         | Input kode unik → foto → submit                     |
| /return/success | Halaman sukses pengembalian                         |

### Admin Pages
| Path                    | Fungsi                                      |
|-------------------------|---------------------------------------------|
| /admin/login            | Form login admin                            |
| /admin                  | Dashboard: stats + list peminjaman pending  |
| /admin/inventory        | CRUD barang, filter, search                 |
| /admin/inventory/:id    | Edit barang                                 |
| /admin/borrowings       | Semua peminjaman, filter by status          |
| /admin/borrowings/:id   | Detail peminjam, foto, approve/reject       |
| /admin/requests         | List request pengadaan                      |
| /admin/requests/new     | Buat request baru                           |
| /admin/requests/:id     | Detail & print request                      |
| /admin/settings         | Manage admin users                          |

### Dashboard Admin Layout
```
┌──────────────┬──────────────┬──────────────┐
│  Total Item  │  On Loan     │  Pending     │
│     142      │     12       │     3        │
└──────────────┴──────────────┴──────────────┘
┌──────────────────────────────────────────┐
│  Peminjaman Pending (3)                  │
│  ┌────────────────────────────────────┐  │
│  │ Ahmad - Laptops - 2 hours ago      │  │
│  │ [Detail] [Approve] [Reject]        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Infrastructure

### Deployment (Ubuntu Server)
- Node.js 20 LTS
- PM2 (auto-restart, crash recovery)
- Nginx (reverse proxy, HTTPS, domain)
- Backup: cron job → tar data/ + public/uploads/

### Development (Windows)
- `npm run dev` → localhost:3000
- Same codebase, cross-platform

### Email Notification
- Gmail SMTP atau SMTP sekolah (Google Workspace)
- Kondisi: approve borrow → kode unik dikirim, reject → notifikasi, approve return → struk pengembalian
- Fallback: tampilkan kode unik di dashboard admin jika email gagal

### Print PDF
- Landscape A4 invoice-style via @react-pdf/renderer
- Bisa download & print langsung dari browser admin

### Backup & Recovery
- SQLite = 1 file, mudah di-copy
- Cron: backup db + uploads ke folder lain

### Security
- Session cookie (httpOnly, signed)
- Rate limit: max 10 request per IP per menit
- QR code URL pakai IP/domain lengkap

---

## PDF Invoice Format (Landscape A4)
```
┌──────────────────────────────────────────────────────────────────────────┐
│                      MUTIARA BANGSA ICT                                  │
│                   SURAT PERMINTAAN BARANG                                │
│                                                                          │
│  No: REQ-20260707-001          Tanggal: 07 Juli 2026                     │
│  Supplier: PT Sukses Mandiri                                             │
├──────────────────────────────────────────────────────────────────────────┤
│  #  │ Item                │ Qty  │ Harga Est.  │ Keterangan              │
│─────┼─────────────────────┼──────┼─────────────┼─────────────────────────│
│  1  │ Tinta Epson L        │  2   │ Rp 150.000  │ Untuk printer ruang guru│
│  2  │ Kabel HDMI 3m        │  5   │ Rp 45.000   │ Koneksi proyektor      │
│  3  │ Mouse Wireless       │ 10   │ Rp 65.000   │ Lab komputer           │
├──────────────────────────────────────────────────────────────────────────┤
│                                      Total Estimasi: Rp 1.015.000        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Dibuat oleh:                 Disetujui:                                 │
│  _________________            _________________                          │
│  (Admin ICT)                  (Kepala Sekolah)                           │
└──────────────────────────────────────────────────────────────────────────┘
```
