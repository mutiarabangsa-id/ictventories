"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <h2 className="text-xl font-semibold text-[#0a0b0d]">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: stats?.totalItems ?? "-", accent: "bg-[#0052ff]" },
          { label: "Currently Borrowed", value: stats?.onLoan ?? "-", accent: "bg-[#f4b000]" },
          { label: "Pending Borrow", value: stats?.pendingBorrow ?? "-", accent: "bg-[#05b169]" },
          { label: "Pending Return", value: stats?.pendingReturn ?? "-", accent: "bg-[#0052ff]" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[24px] overflow-hidden border border-[#dee1e6]">
            <CardContent className="p-0">
              <div className="p-5">
                <p className="text-sm text-[#7c828a]">{stat.label}</p>
                <p className="text-3xl font-semibold text-[#0a0b0d] mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[24px] border border-[#dee1e6]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[#0a0b0d]">Pending Borrow Approval</CardTitle>
            <Link href="/admin/borrowings"><Button variant="ghost" size="sm" className="rounded-full">View All</Button></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingBorrow.length === 0 && <p className="text-sm text-[#7c828a]">No pending items.</p>}
            {pendingBorrow.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-[#f7f7f7] rounded-[12px] p-3">
                <div>
                  <p className="font-medium text-sm text-[#0a0b0d]">{b.borrowerName}</p>
                  <p className="text-xs text-[#7c828a]">{b.borrowerType} • {new Date(b.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleReject(b.id)} className="text-[#cf202f] hover:bg-red-50 rounded-full">Reject</Button>
                  <Button size="sm" onClick={() => handleApprove(b.id, "approve_borrow")} className="rounded-full">Approve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#dee1e6]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[#0a0b0d]">Pending Return Approval</CardTitle>
            <Link href="/admin/borrowings"><Button variant="ghost" size="sm" className="rounded-full">View All</Button></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingReturn.length === 0 && <p className="text-sm text-[#7c828a]">No pending items.</p>}
            {pendingReturn.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-[#f7f7f7] rounded-[12px] p-3">
                <div>
                  <p className="font-medium text-sm text-[#0a0b0d]">{b.borrowerName}</p>
                  <p className="text-xs text-[#7c828a]">{b.borrowerType} • {new Date(b.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <Button size="sm" onClick={() => handleApprove(b.id, "approve_return")} className="rounded-full">Approve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}