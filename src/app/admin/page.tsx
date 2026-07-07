"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Stats {
  totalItems: number;
  onLoan: number;
  pendingBorrow: number;
  pendingReturn: number;
}

interface BorrowingEntry {
  id: string;
  borrowerName: string;
  borrowerType: string;
  itemId: string;
  status: string;
  createdAt: number;
  itemName?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingBorrow, setPendingBorrow] = useState<BorrowingEntry[]>([]);
  const [pendingReturn, setPendingReturn] = useState<BorrowingEntry[]>([]);

  const fetchData = async () => {
    try {
      const statsRes = await fetch("/api/admin/stats");
      setStats(await statsRes.json());

      const borrowRes = await fetch("/api/admin/borrowings");
      const borrowData = await borrowRes.json();
      setPendingBorrow(borrowData.borrowings?.filter((b: any) => b.status === "pending_borrow").slice(0, 5) || []);
      setPendingReturn(borrowData.borrowings?.filter((b: any) => b.status === "pending_return").slice(0, 5) || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string, action: "approve_borrow" | "approve_return") => {
    await fetch(`/api/admin/borrowings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchData();
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/borrowings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject_borrow" }),
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Barang", value: stats?.totalItems ?? "-", color: "bg-blue-500" },
          { label: "Sedang Dipinjam", value: stats?.onLoan ?? "-", color: "bg-amber-500" },
          { label: "Menunggu Pinjam", value: stats?.pendingBorrow ?? "-", color: "bg-emerald-500" },
          { label: "Menunggu Kembali", value: stats?.pendingReturn ?? "-", color: "bg-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`${stat.color} h-1`} />
              <div className="p-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">📋 Menunggu Persetujuan Pinjam</CardTitle>
            <Link href="/admin/borrowings"><Button variant="ghost" size="sm">Lihat Semua</Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBorrow.length === 0 && <p className="text-sm text-gray-500">Tidak ada yang menunggu.</p>}
            {pendingBorrow.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{b.borrowerName}</p>
                  <p className="text-xs text-gray-500">{b.borrowerType} • {new Date(b.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleReject(b.id)} className="text-red-600 hover:text-red-700">Tolak</Button>
                  <Button size="sm" onClick={() => handleApprove(b.id, "approve_borrow")}>Setuju</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">🔄 Menunggu Persetujuan Kembali</CardTitle>
            <Link href="/admin/borrowings"><Button variant="ghost" size="sm">Lihat Semua</Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReturn.length === 0 && <p className="text-sm text-gray-500">Tidak ada yang menunggu.</p>}
            {pendingReturn.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{b.borrowerName}</p>
                  <p className="text-xs text-gray-500">{b.borrowerType} • {new Date(b.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <Button size="sm" onClick={() => handleApprove(b.id, "approve_return")}>Setuju</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
