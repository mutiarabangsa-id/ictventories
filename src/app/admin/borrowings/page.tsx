"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

const STATUS_MAP: Record<string, { label: string; variant: "warning" | "default" | "success" | "destructive" }> = {
  pending_borrow: { label: "Pending Borrow", variant: "warning" },
  borrowed: { label: "Borrowed", variant: "default" },
  pending_return: { label: "Pending Return", variant: "warning" },
  returned: { label: "Completed", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
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
      <h2 className="text-xl font-semibold text-[#0a0b0d]">Borrowings</h2>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search name or item..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex gap-1 flex-wrap">
          {[{ key: "all", label: "All" }, { key: "pending_borrow", label: "Pending Borrow" }, { key: "borrowed", label: "Borrowed" }, { key: "pending_return", label: "Pending Return" }, { key: "returned", label: "Completed" }, { key: "rejected", label: "Rejected" }].map((f) => (
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
              <thead className="bg-[#f7f7f7] border-b border-[#dee1e6]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Borrower</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Item</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Qty</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Status</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Date</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee1e6]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f7f7f7]">
                    <td className="p-3">
                      <p className="font-medium text-[#0a0b0d]">{b.borrowerName}</p>
                      <p className="text-xs text-[#7c828a]">{b.borrowerType}</p>
                    </td>
                    <td className="p-3 text-[#5b616e]">{b.itemName}</td>
                    <td className="p-3 text-center text-[#5b616e]">{b.quantity}</td>
                    <td className="p-3 text-center">
                      <Badge variant={STATUS_MAP[b.status]?.variant}>{STATUS_MAP[b.status]?.label}</Badge>
                    </td>
                    <td className="p-3 text-xs text-[#7c828a]">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                    <td className="p-3 text-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(b)}>Detail</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-6 text-[#7c828a]">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[24px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-[#0a0b0d]">Borrowing Details</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-[#f7f7f7] rounded-[16px] p-4 space-y-2">
                <div className="flex justify-between"><span className="text-[#7c828a]">Borrower</span><span className="font-medium text-[#0a0b0d]">{selected.borrowerName}</span></div>
                <div className="flex justify-between"><span className="text-[#7c828a]">Type</span><span className="text-[#5b616e]">{selected.borrowerType}</span></div>
                <div className="flex justify-between"><span className="text-[#7c828a]">Email</span><span className="text-[#5b616e]">{selected.borrowerEmail}</span></div>
                <div className="flex justify-between"><span className="text-[#7c828a]">Phone</span><span className="text-[#5b616e]">{selected.borrowerPhone}</span></div>
                <div className="flex justify-between"><span className="text-[#7c828a]">Item</span><span className="font-medium text-[#0a0b0d]">{selected.itemName}</span></div>
                <div className="flex justify-between"><span className="text-[#7c828a]">Quantity</span><span className="text-[#5b616e]">{selected.quantity}</span></div>
                <div className="flex justify-between"><span className="text-[#7c828a]">Unique Code</span><span className="font-mono font-bold text-[#0052ff]">{selected.uniqueCode || "-"}</span></div>
                <div className="flex justify-between"><span className="text-[#7c828a]">Status</span><Badge variant={STATUS_MAP[selected.status]?.variant}>{STATUS_MAP[selected.status]?.label}</Badge></div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-[#0a0b0d]">Borrow Photo:</p>
                {selected.borrowImageUrl && <img src={selected.borrowImageUrl} alt="Borrow" className="rounded-[16px] w-full max-h-48 object-cover" />}
              </div>

              {selected.returnImageUrl && (
                <div className="space-y-2">
                  <p className="font-medium text-[#0a0b0d]">Return Photo:</p>
                  <img src={selected.returnImageUrl} alt="Return" className="rounded-[16px] w-full max-h-48 object-cover" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                {selected.status === "pending_borrow" && (
                  <>
                    <Button variant="destructive" className="flex-1" onClick={() => handleAction(selected.id, "reject_borrow")}>Reject</Button>
                    <Button className="flex-1" onClick={() => handleAction(selected.id, "approve_borrow")}>Approve Borrow</Button>
                  </>
                )}
                {selected.status === "pending_return" && (
                  <Button className="flex-1" onClick={() => handleAction(selected.id, "approve_return")}>Approve Return</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
