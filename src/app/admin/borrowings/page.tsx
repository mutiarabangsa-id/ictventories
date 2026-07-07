"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Borrowing {
  id: string;
  borrowerName: string;
  borrowerType: string;
  borrowerEmail: string;
  borrowerPhone: string;
  itemId: string;
  quantity: number;
  uniqueCode: string;
  status: string;
  borrowImageUrl: string;
  returnImageUrl: string | null;
  borrowedAt: number | null;
  returnedAt: number | null;
  createdAt: number;
  itemName: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_borrow: { label: "Menunggu Pinjam", color: "bg-amber-100 text-amber-700" },
  borrowed: { label: "Dipinjam", color: "bg-blue-100 text-blue-700" },
  pending_return: { label: "Menunggu Kembali", color: "bg-purple-100 text-purple-700" },
  returned: { label: "Selesai", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
};

export default function BorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Borrowing | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/admin/borrowings");
    const data = await res.json();
    setBorrowings(data.borrowings || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/borrowings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchData();
    setSelected(null);
  };

  const filtered = borrowings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search && !b.borrowerName.toLowerCase().includes(search.toLowerCase()) && !b.itemName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">📋 Peminjaman</h2>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Cari nama atau barang..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex gap-1 flex-wrap">
          {[{ key: "all", label: "Semua" }, { key: "pending_borrow", label: "Pending Pinjam" }, { key: "borrowed", label: "Dipinjam" }, { key: "pending_return", label: "Pending Kembali" }, { key: "returned", label: "Selesai" }, { key: "rejected", label: "Ditolak" }].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Peminjam</th>
                  <th className="text-left p-3 font-medium text-gray-600">Barang</th>
                  <th className="text-center p-3 font-medium text-gray-600">Qty</th>
                  <th className="text-center p-3 font-medium text-gray-600">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600">Tanggal</th>
                  <th className="text-center p-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{b.borrowerName}</p>
                      <p className="text-xs text-gray-500">{b.borrowerType}</p>
                    </td>
                    <td className="p-3">{b.itemName}</td>
                    <td className="p-3 text-center">{b.quantity}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_MAP[b.status]?.color}`}>
                        {STATUS_MAP[b.status]?.label}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                    <td className="p-3 text-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(b)}>Detail</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-6 text-gray-400">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Detail Peminjaman</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Peminjam</span><span className="font-medium">{selected.borrowerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Jenis</span><span>{selected.borrowerType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{selected.borrowerEmail}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">WA</span><span>{selected.borrowerPhone}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Barang</span><span className="font-medium">{selected.itemName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Jumlah</span><span>{selected.quantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Kode Unik</span><span className="font-mono font-bold text-blue-600">{selected.uniqueCode || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`text-xs px-2 py-1 rounded-full ${STATUS_MAP[selected.status]?.color}`}>{STATUS_MAP[selected.status]?.label}</span></div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Foto Pinjam:</p>
                {selected.borrowImageUrl && <img src={selected.borrowImageUrl} alt="Borrow" className="rounded-lg w-full max-h-48 object-cover" />}
              </div>

              {selected.returnImageUrl && (
                <div className="space-y-2">
                  <p className="font-medium">Foto Kembali:</p>
                  <img src={selected.returnImageUrl} alt="Return" className="rounded-lg w-full max-h-48 object-cover" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Tutup</Button>
                {selected.status === "pending_borrow" && (
                  <>
                    <Button variant="destructive" className="flex-1" onClick={() => handleAction(selected.id, "reject_borrow")}>Tolak</Button>
                    <Button className="flex-1" onClick={() => handleAction(selected.id, "approve_borrow")}>Setuju Pinjam</Button>
                  </>
                )}
                {selected.status === "pending_return" && (
                  <Button className="flex-1" onClick={() => handleAction(selected.id, "approve_return")}>Setuju Kembali</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
