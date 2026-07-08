"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Request {
  id: string;
  requestNumber: string;
  supplierName: string;
  status: string;
  itemsData: string;
  createdAt: number;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    fetch("/api/admin/requests").then(r => r.json()).then(d => setRequests(d.requests || []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0a0b0d]">Procurement</h2>
        <Link href="/admin/requests/new"><Button size="sm">+ New Request</Button></Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f7f7] border-b border-[#dee1e6]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#5b616e]">No. Request</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Supplier</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Status</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Date</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee1e6]">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f7f7f7]">
                    <td className="p-3 font-mono text-sm text-[#0a0b0d]">{r.requestNumber}</td>
                    <td className="p-3 text-[#0a0b0d]">{r.supplierName}</td>
                    <td className="p-3 text-center">
                      <Badge variant={r.status === "submitted" ? "success" : "secondary"}>{r.status === "submitted" ? "Submitted" : "Draft"}</Badge>
                    </td>
                    <td className="p-3 text-xs text-[#7c828a]">{new Date(r.createdAt).toLocaleDateString("id-ID")}</td>
                    <td className="p-3 text-center">
                      <Link href={`/admin/requests/${r.id}`}><Button variant="ghost" size="sm">Detail</Button></Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={5} className="text-center p-6 text-[#7c828a]">No requests yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
