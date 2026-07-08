"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, RotateCcw } from "lucide-react";

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

const STATUS_MAP: Record<string, { label: string; variant: "default" | "warning" | "success" | "destructive" }> = {
  pending_borrow: { label: "Pending", variant: "warning" },
  borrowed: { label: "On Loan", variant: "default" },
  pending_return: { label: "Pending Return", variant: "warning" },
  returned: { label: "Completed", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
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
    <div className="min-h-screen bg-white">
      <section className="bg-[#0a0b0d] text-white text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="w-12 h-12 bg-white/10 rounded-[14px] flex items-center justify-center mx-auto mb-8">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-3">
            MUTIARA BANGSA ICT
          </h1>
          <p className="text-base sm:text-lg text-[#a8acb3] mb-10 leading-relaxed max-w-xl mx-auto">
            ICT Inventory, Request & Borrowing System
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/borrow">
              <Button className="rounded-full bg-[#0052ff] hover:bg-[#003ecc] text-white px-6 sm:px-8 h-12 text-base font-semibold">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Borrow Item
              </Button>
            </Link>
            <Link href="/return">
              <Button className="rounded-full bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 h-12 text-base font-semibold border-0">
                <RotateCcw className="h-4 w-4 mr-2" />
                Return
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-6 -mt-10 sm:-mt-14">
        <div className="grid grid-cols-2">
          <div className="bg-white rounded-l-[20px] border border-[#dee1e6] border-r-0 p-5 sm:p-8 text-center">
            <p className="text-xs font-medium text-[#7c828a] uppercase tracking-wider mb-2 sm:mb-3">Total Items</p>
            <p className="text-2xl sm:text-3xl font-mono font-medium text-[#0a0b0d]">
              {loading ? "-" : stats?.totalItems}
            </p>
          </div>
          <div className="bg-white rounded-r-[20px] border border-[#dee1e6] p-5 sm:p-8 text-center">
            <p className="text-xs font-medium text-[#7c828a] uppercase tracking-wider mb-2 sm:mb-3">On Loan</p>
            <p className="text-2xl sm:text-3xl font-mono font-medium text-[#0052ff]">
              {loading ? "-" : stats?.onLoan}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-light text-[#0a0b0d]">Recent Activity</h2>
          <span className="text-xs text-[#7c828a]">Last 10</span>
        </div>
        {loading ? (
          <p className="text-center py-12 text-[#7c828a] text-sm">Loading...</p>
        ) : borrowings.length === 0 ? (
          <p className="text-center py-12 text-[#7c828a] text-sm">No borrowing activity yet</p>
        ) : (
          <div className="space-y-2 sm:space-y-1">
            {borrowings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 rounded-[12px] hover:bg-[#f7f7f7] transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-[#0a0b0d] truncate">{b.itemName}</p>
                  <p className="text-xs text-[#7c828a] mt-0.5 truncate">
                    {b.borrowerName} ({b.borrowerType}) &middot;{" "}
                    {new Date(b.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <Badge variant={STATUS_MAP[b.status]?.variant || "default"} className="shrink-0">
                  {STATUS_MAP[b.status]?.label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}