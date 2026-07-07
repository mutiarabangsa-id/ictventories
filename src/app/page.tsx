"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, RefreshCw, ClipboardList, Info, HelpCircle } from "lucide-react";

interface Stats {
  totalItems: number;
  onLoan: number;
}

interface Borrowing {
  id: string;
  borrowerName: string;
  borrowerType: string;
  itemName: string;
  status: string;
  createdAt: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_borrow: { label: "Pending", color: "bg-amber-100 text-amber-800" },
  borrowed: { label: "Dipinjam", color: "bg-blue-100 text-blue-800" },
  pending_return: { label: "Pending Kembali", color: "bg-purple-100 text-purple-800" },
  returned: { label: "Selesai", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-800" },
};

export default function PublicDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setBorrowings(d.borrowings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC] font-sans">
      {/* Top Banner Header */}
      <div className="bg-[#0F172A] text-white px-4 md:px-6 py-6 md:py-12 border-b-2 border-slate-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">MUTIARA BANGSA ICT</h1>
            <p className="text-slate-300 mt-1 md:text-base text-xs">Sistem Inventaris, Permintaan, & Peminjaman Barang</p>
          </div>
          <div className="hidden sm:flex w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-xl items-center justify-center border border-slate-700 text-white font-extrabold text-lg md:text-2xl">
            ICT
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 md:px-6 space-y-6 md:space-y-8">
        {/* Quick Actions (Card Besar Pinjam & Kembali) */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <Link href="/borrow" className="block group">
            <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-5 md:p-6 hover:bg-[#F8FAFC] transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base md:text-lg text-[#0F172A] group-hover:text-blue-700 transition-colors">Pinjam Barang</h3>
                <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 md:mt-1 truncate">Pilih barang ICT dari daftar & isi data diri</p>
              </div>
            </div>
          </Link>

          <Link href="/return" className="block group">
            <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-5 md:p-6 hover:bg-[#F8FAFC] transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                <RefreshCw className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base md:text-lg text-[#0F172A] group-hover:text-emerald-700 transition-colors">Kembalikan Barang</h3>
                <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 md:mt-1 truncate">Gunakan kode unik Anda untuk verifikasi kembali</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Item</p>
            <div className="flex items-baseline gap-1.5 md:gap-2 mt-1.5 md:mt-2">
              <span className="text-2xl md:text-3xl font-bold font-mono text-[#0F172A]">{loading ? "-" : stats?.totalItems}</span>
              <span className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:inline">unit terdaftar</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-[#64748B] uppercase tracking-wider">Sedang Dipinjam</p>
            <div className="flex items-baseline gap-1.5 md:gap-2 mt-1.5 md:mt-2">
              <span className="text-2xl md:text-3xl font-bold font-mono text-blue-600">{loading ? "-" : stats?.onLoan}</span>
              <span className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:inline">unit aktif</span>
            </div>
          </div>
        </div>

        {/* Recent Borrowings List */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-[#FAFBFC] flex items-center justify-between">
            <h3 className="font-bold text-[14px] text-[#0F172A]">Aktivitas Peminjaman Terbaru</h3>
            <span className="text-xs text-slate-400">10 aktivitas terakhir</span>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-400">Memuat data...</p>
            ) : borrowings.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">Belum ada aktivitas peminjaman</p>
            ) : (
              borrowings.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-[13px] text-[#0F172A] truncate">{b.itemName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.borrowerName} ({b.borrowerType}) • {new Date(b.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_MAP[b.status]?.color || "bg-slate-100 text-slate-600"}`}>
                    {STATUS_MAP[b.status]?.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
