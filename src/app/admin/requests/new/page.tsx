"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RequestItem {
  name: string;
  qty: number;
  est_price: number;
  desc: string;
}

export default function NewRequestPage() {
  const [supplier, setSupplier] = useState("");
  const [itemsList, setItemsList] = useState<RequestItem[]>([{ name: "", qty: 1, est_price: 0, desc: "" }]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const addItem = () => setItemsList([...itemsList, { name: "", qty: 1, est_price: 0, desc: "" }]);
  const removeItem = (i: number) => setItemsList(itemsList.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof RequestItem, value: string | number) => {
    const updated = [...itemsList];
    (updated[i] as any)[field] = value;
    setItemsList(updated);
  };

  const handleSave = async (status: "draft" | "submitted") => {
    setSaving(true);
    await fetch("/api/admin/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierName: supplier, itemsData: itemsList, status }),
    });
    setSaving(false);
    router.push("/admin/requests");
  };

  const total = itemsList.reduce((sum, i) => sum + (i.est_price * i.qty), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">+ Request Pengadaan Baru</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label>Nama Supplier</Label>
            <Input placeholder="PT Contoh Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Daftar Barang</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>+ Tambah</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {itemsList.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Barang {i + 1}</span>
                {itemsList.length > 1 && (
                  <Button variant="ghost" size="sm" className="text-red-600 h-7" onClick={() => removeItem(i)}>✕</Button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Nama Barang</Label>
                  <Input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" min={1} value={item.qty} onChange={(e) => updateItem(i, "qty", parseInt(e.target.value) || 1)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Harga Est. (Rp)</Label>
                  <Input type="number" min={0} value={item.est_price} onChange={(e) => updateItem(i, "est_price", parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Keterangan</Label>
                  <Input value={item.desc} onChange={(e) => updateItem(i, "desc", e.target.value)} placeholder="Opsional" />
                </div>
              </div>
            </div>
          ))}

          <div className="text-right text-sm text-gray-600 pt-2">
            Total Estimasi: <span className="font-bold text-gray-900">Rp {total.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => handleSave("draft")} disabled={saving || !supplier}>
              Simpan Draft
            </Button>
            <Button className="flex-1" onClick={() => handleSave("submitted")} disabled={saving || !supplier || itemsList.some(i => !i.name)}>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
