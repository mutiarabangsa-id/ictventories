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
