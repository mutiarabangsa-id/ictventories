"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <h2 className="text-2xl font-bold text-gray-900">📝 Pengadaan</h2>
        <Link href="/admin/requests/new"><Button size="sm">+ Request Baru</Button></Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">No. Request</th>
                  <th className="text-left p-3 font-medium text-gray-600">Supplier</th>
                  <th className="text-center p-3 font-medium text-gray-600">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600">Tanggal</th>
                  <th className="text-center p-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{r.requestNumber}</td>
                    <td className="p-3">{r.supplierName}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === "submitted" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {r.status === "submitted" ? "Submitted" : "Draft"}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString("id-ID")}</td>
                    <td className="p-3 text-center">
                      <Link href={`/admin/requests/${r.id}`}><Button variant="ghost" size="sm">Detail</Button></Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={5} className="text-center p-6 text-gray-400">Belum ada request</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
