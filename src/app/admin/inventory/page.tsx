"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  availableQty: number;
  location: string;
}

const CATEGORIES = ["hardware", "consumable", "tools"];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [form, setForm] = useState({ name: "", category: "hardware", brand: "", quantity: "1", location: "ICT Lab" });

  const fetchItems = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    const res = await fetch(`/api/admin/inventory?${params}`);
    const data = await res.json();
    setItems(data.items || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (editItem) {
      await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editItem.id, quantity: parseInt(form.quantity) }),
      });
    } else {
      await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: parseInt(form.quantity) }),
      });
    }
    setShowModal(false);
    setEditItem(null);
    setForm({ name: "", category: "hardware", brand: "", quantity: "1", location: "ICT Lab" });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    await fetch(`/api/admin/inventory?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleImport = async () => {
    await fetch("/api/admin/inventory/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvText }),
    });
    setCsvText("");
    setShowImport(false);
    fetchItems();
  };

  const exportCsv = () => {
    const header = "Name,Category,Brand,Quantity,Location\n";
    const rows = items.map((i) => `${i.name},${i.category},${i.brand},${i.quantity},${i.location}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📦 Inventory</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)}>Import CSV</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
          <Button size="sm" onClick={() => { setEditItem(null); setForm({ name: "", category: "hardware", brand: "", quantity: "1", location: "ICT Lab" }); setShowModal(true); }}>+ Barang</Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <Input placeholder="Cari barang..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchItems()} className="max-w-xs" />
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm max-w-[150px]"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); fetchItems(); }}
        >
          <option value="">Semua</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={fetchItems}>Cari</Button>
      </div>

      {/* Import CSV Section */}
      {showImport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">Format: Name,Category,Brand,Quantity,Location (header baris pertama otomatis diabaikan)</p>
            <textarea
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[150px]"
              placeholder="Name,Category,Brand,Quantity,Location&#10;Tinta Epson L,consumable,Epson,5,ICT Lab&#10;Mouse Wireless,hardware,Logitech,10,ICT Lab"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <Button onClick={handleImport} disabled={!csvText}>Import</Button>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Nama</th>
                  <th className="text-left p-3 font-medium text-gray-600">Kategori</th>
                  <th className="text-left p-3 font-medium text-gray-600">Brand</th>
                  <th className="text-center p-3 font-medium text-gray-600">Stok</th>
                  <th className="text-center p-3 font-medium text-gray-600">Tersedia</th>
                  <th className="text-center p-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${item.category === "hardware" ? "bg-blue-100 text-blue-700" : item.category === "consumable" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{item.brand}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-center">
                      <span className={item.availableQty > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{item.availableQty}</span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditItem(item); setForm({ name: item.name, category: item.category, brand: item.brand, quantity: String(item.quantity), location: item.location }); setShowModal(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(item.id)}>Hapus</Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-6 text-gray-400">Belum ada barang</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editItem ? "Edit Barang" : "Tambah Barang"}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Nama</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Kategori</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Brand</Label>
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Jumlah</Label>
                  <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Lokasi</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                <Button className="flex-1" onClick={handleSave} disabled={!form.name || !form.brand}>Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
