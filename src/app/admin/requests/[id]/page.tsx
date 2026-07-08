"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RequestData {
  id: string;
  requestNumber: string;
  supplierName: string;
  status: string;
  itemsData: string;
  createdAt: number;
}

interface RequestItem {
  name: string;
  qty: number;
  est_price: number;
  desc: string;
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const [req, setReq] = useState<RequestData | null>(null);
  const [itemsList, setItemsList] = useState<RequestItem[]>([]);

  useEffect(() => {
    fetch(`/api/admin/requests/${id}`).then(r => r.json()).then(d => {
      if (d.request) {
        setReq(d.request);
        try {
          setItemsList(JSON.parse(d.request.itemsData));
        } catch {
          setItemsList([]);
        }
      }
    });
  }, [id]);

  const total = itemsList.reduce((sum, i) => sum + (i.est_price * i.qty), 0);
  const dateStr = req ? new Date(req.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Goods Request - ${req?.requestNumber}</title>
        <style>
          @page { size: A4 landscape; margin: 20mm; }
          body { font-family: Arial, sans-serif; color: #000; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
          .header h1 { font-size: 18px; margin: 0; }
          .header h2 { font-size: 22px; margin: 5px 0; text-transform: uppercase; }
          .info { margin-bottom: 20px; font-size: 14px; }
          .info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 13px; }
          th { background: #f0f0f0; font-weight: bold; }
          .total { text-align: right; font-size: 14px; font-weight: bold; margin: 20px 0; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
          .signature { text-align: center; width: 200px; }
          .signature .line { border-top: 1px solid #000; margin-top: 80px; padding-top: 5px; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MUTIARA BANGSA ICT</h1>
          <h2>GOODS REQUEST LETTER</h2>
        </div>
        <div class="info">
          <p><strong>No:</strong> ${req?.requestNumber || ""}</p>
          <p><strong>Tanggal:</strong> ${dateStr}</p>
          <p><strong>Supplier:</strong> ${req?.supplierName || ""}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Est. Price</th>
              <th>Subtotal</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>Rp ${item.est_price.toLocaleString("id-ID")}</td>
                <td>Rp ${(item.est_price * item.qty).toLocaleString("id-ID")}</td>
                <td>${item.desc || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="total">Total Estimate: Rp ${total.toLocaleString("id-ID")}</div>
        <div class="signatures">
          <div class="signature">
            <div class="line">Prepared by<br/>(ICT Admin)</div>
          </div>
          <div class="signature">
            <div class="line">Approved by<br/>(Principal)</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!req) return <div className="p-6 text-[#7c828a]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0a0b0d]">Detail Request</h2>
        <Button onClick={handlePrint}>Print Letter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div>
              <span className="text-[#5b616e]">No. Request</span>
              <p className="font-mono font-medium text-[#0a0b0d]">{req.requestNumber}</p>
            </div>
            <div>
              <span className="text-[#5b616e]">Supplier</span>
              <p className="font-medium text-[#0a0b0d]">{req.supplierName}</p>
            </div>
            <div>
              <span className="text-[#5b616e]">Status</span>
              <p><Badge variant={req.status === "submitted" ? "success" : "secondary"}>{req.status}</Badge></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f7f7] border-b border-[#dee1e6]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#5b616e]">#</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Name</th>
                  <th className="text-center p-3 font-medium text-[#5b616e]">Qty</th>
                  <th className="text-right p-3 font-medium text-[#5b616e]">Est. Price</th>
                  <th className="text-right p-3 font-medium text-[#5b616e]">Subtotal</th>
                  <th className="text-left p-3 font-medium text-[#5b616e]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee1e6]">
                {itemsList.map((item, i) => (
                  <tr key={i}>
                    <td className="p-3 text-[#0a0b0d]">{i + 1}</td>
                    <td className="p-3 font-medium text-[#0a0b0d]">{item.name}</td>
                    <td className="p-3 text-center text-[#0a0b0d]">{item.qty}</td>
                    <td className="p-3 text-right text-[#0a0b0d]">Rp {item.est_price.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-right font-medium text-[#0a0b0d]">Rp {(item.est_price * item.qty).toLocaleString("id-ID")}</td>
                    <td className="p-3 text-[#7c828a]">{item.desc || "-"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-[#dee1e6] bg-[#f7f7f7]">
                <tr>
                  <td colSpan={4} className="p-3 text-right font-bold text-[#0a0b0d]">Total Estimate:</td>
                  <td className="p-3 text-right font-bold text-[#0052ff]">Rp {total.toLocaleString("id-ID")}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
