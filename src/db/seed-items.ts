import { db } from './index';
import { items } from './schema';
import crypto from 'crypto';

const sampleItems = [
  // Hardware
  { name: 'Laptop ASUS VivoBook 14', category: 'hardware', brand: 'ASUS', quantity: 15, imageUrl: '/uploads/hardware-1.jpg' },
  { name: 'Proyektor Epson EB-X51', category: 'hardware', brand: 'Epson', quantity: 5, imageUrl: '/uploads/hardware-2.jpg' },
  { name: 'Keyboard Mechanical Logitech', category: 'hardware', brand: 'Logitech', quantity: 20, imageUrl: '/uploads/hardware-3.jpg' },
  { name: 'Mouse Wireless Logitech M240', category: 'hardware', brand: 'Logitech', quantity: 25, imageUrl: '/uploads/hardware-4.jpg' },
  { name: 'Monitor LED 22" Samsung', category: 'hardware', brand: 'Samsung', quantity: 10, imageUrl: '/uploads/hardware-5.jpg' },
  // Consumable
  { name: 'Tinta Epson L3210 - Black', category: 'consumable', brand: 'Epson', quantity: 30, imageUrl: '/uploads/consumable-1.jpg' },
  { name: 'Kertas A4 70g - 1 Rim', category: 'consumable', brand: 'PaperOne', quantity: 50, imageUrl: '/uploads/consumable-2.jpg' },
  { name: 'Kabel HDMI 3 Meter', category: 'consumable', brand: 'Vention', quantity: 15, imageUrl: '/uploads/consumable-3.jpg' },
  { name: 'Baterai AA Alkaline', category: 'consumable', brand: 'Energizer', quantity: 100, imageUrl: '/uploads/consumable-4.jpg' },
  // Tools
  { name: 'Obeng Set 12-in-1', category: 'tools', brand: 'Tekiro', quantity: 8, imageUrl: '/uploads/tools-1.jpg' },
  { name: 'Multitester Digital', category: 'tools', brand: 'Sanwa', quantity: 5, imageUrl: '/uploads/tools-2.jpg' },
  { name: 'Crimping Tool RJ45', category: 'tools', brand: 'Taffware', quantity: 6, imageUrl: '/uploads/tools-3.jpg' },
];

async function seedItems() {
  for (const item of sampleItems) {
    await db.insert(items).values({
      id: crypto.randomUUID(),
      name: item.name,
      category: item.category,
      brand: item.brand,
      quantity: item.quantity,
      availableQty: item.quantity,
      location: 'ICT Lab',
      imageUrl: item.imageUrl,
      createdAt: Date.now(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${sampleItems.length} items.`);
}

seedItems().catch(console.error);
