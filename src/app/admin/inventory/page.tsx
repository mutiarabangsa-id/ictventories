"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
    if (!confirm("Delete this item?")) return;
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
        <h2 className="text-xl font-semibold text-[#0a0b0d]">Inventory</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)}>Import CSV</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
          <Button size="sm" onClick={() => { setEditItem(null); setForm({ name: "", category: "hardware", brand: "", quantity: "1", location: "ICT Lab" }); setShowModal(true); }}>+ Item</Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchItems()} className="max-w-xs bg-white" />
        <select
          className="flex h-9 rounded-[12px] border border-[#dee1e6] bg-white px-3 py-1 text-sm max-w-[150px]"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); fetchItems(); }}
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={fetchItems}>Search</Button>
      </div>

      {/* Import CSV Section */}
      {showImport && (
        <Card className="rounded-[24px] border border-[#dee1e6]">
          <CardHeader>
            <CardTitle className="text-base text-[#0a0b0d]">Import CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#7c828a]">Format: Name,Category,Brand,Quantity,Location (first row header is auto-ignored)</p>
            <textarea
              className="flex w-full rounded-[12px] border border-[#dee1e6] bg-white px-3 py-2 text-sm min-h-[150px] text-[#0a0b0d] placeholder:text-[#7c828a]"
              placeholder="Name,Category,Brand,Quantity,Location&#10;Epson Ink,consumable,Epson,5,ICT Lab&#10;Wireless Mouse,hardware,Logitech,10,ICT Lab"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <Button onClick={handleImport} disabled={!csvText}>Import</Button>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className="rounded-[24px] border border-[#dee1e6]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f7f7] border-b border-[#dee1e6]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Name</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Category</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Brand</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Stock</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Available</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee1e6]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7f7f7]">
                    <td className="p-3 font-medium text-[#0a0b0d]">{item.name}</td>
                    <td className="p-3">
                      <Badge variant={item.category === "hardware" ? "default" : item.category === "consumable" ? "warning" : "success"}>
                        {item.category}
                      </Badge>
                    </td>
                    <td className="p-3 text-[#5b616e]">{item.brand}</td>
                    <td className="p-3 text-center text-[#0a0b0d]">{item.quantity}</td>
                    <td className="p-3 text-center">
                      <span className={item.availableQty > 0 ? "text-[#05b169] font-medium" : "text-[#cf202f] font-medium"}>{item.availableQty}</span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditItem(item); setForm({ name: item.name, category: item.category, brand: item.brand, quantity: String(item.quantity), location: item.location }); setShowModal(true); }}>Edit</Button>
                       <Button variant="ghost" size="sm" className="text-[#cf202f]" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                   <tr><td colSpan={6} className="text-center p-6 text-[#7c828a]">No items yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[24px] p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#0a0b0d] mb-4">{editItem ? "Edit Item" : "Add Item"}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[#5b616e]">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-[12px] bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[#5b616e]">Category</Label>
                  <select className="flex h-9 w-full rounded-[12px] border border-[#dee1e6] bg-white px-3 py-1 text-sm text-[#0a0b0d]" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#5b616e]">Brand</Label>
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-[12px] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[#5b616e]">Quantity</Label>
                  <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="rounded-[12px] bg-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[#5b616e]">Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-[12px] bg-white" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSave} disabled={!form.name || !form.brand}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
