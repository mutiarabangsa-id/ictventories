"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, Search, ChevronLeft } from "lucide-react";

interface BorrowingData {
  borrowing: {
    id: string;
    borrowerName: string;
    borrowerType: string;
    borrowerEmail: string;
    borrowerPhone: string;
    quantity: number;
    uniqueCode: string;
    status: string;
  };
  item: {
    name: string;
    brand: string;
    location: string;
  };
}

export default function ReturnPage() {
  const [uniqueCode, setUniqueCode] = useState("");
  const [lookupResult, setLookupResult] = useState<BorrowingData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLookup = async () => {
    setError("");
    try {
      const res = await fetch("/api/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueCode: uniqueCode.toUpperCase(), action: "lookup" }),
      });
      const data = await res.json();
      if (data.success) {
        setLookupResult(data);
        setStep(2);
      } else {
        setError(data.error || "Kode unik tidak ditemukan");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReturn = async () => {
    if (!imagePreview || !lookupResult) return;
    setSubmitting(true);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });
      const { url } = await uploadRes.json();
      const returnRes = await fetch("/api/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueCode: uniqueCode.toUpperCase(), returnImageUrl: url, action: "submit_return" }),
      });
      const data = await returnRes.json();
      if (data.success) setSuccess(true);
      else setError(data.error || "Gagal mengajukan pengembalian");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-[#1E293B] rounded-xl p-8 w-full max-w-md text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
          <h2 className="text-xl font-bold text-[#0F172A]">Pengembalian Diajukan</h2>
          <p className="text-sm text-[#475569] mt-1">Admin akan memverifikasi pengembalian Anda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-[#E2E8F0] bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center text-white font-bold text-sm">MB</div>
            <span className="font-bold text-[#0F172A]">ICT Inventory</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <span className="font-semibold text-[#0F172A] bg-[#DBEAFE] text-[#1E40AF] px-3 py-1 rounded-md">Kembalikan Barang</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-8 md:px-6">
          {step === 1 && (
            <div className="max-w-md mx-auto">
              <div className="bg-white border-2 border-[#1E293B] rounded-xl p-6">
                <h2 className="font-bold text-[17px] text-[#0F172A] mb-1">Masukkan Kode Unik</h2>
                <p className="text-[13px] text-[#64748B] mb-6">Kode 6 karakter yang Anda terima saat peminjaman</p>
                <div className="mb-4">
                  <Input
                    className="h-12 text-center text-2xl tracking-[0.3em] font-mono font-bold border-2 border-[#E2E8F0] focus:border-[#2563EB] rounded-lg uppercase"
                    placeholder="ABC123"
                    value={uniqueCode}
                    onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-4">{error}</p>
                )}
                <Button
                  onClick={handleLookup}
                  disabled={uniqueCode.length < 6}
                  className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-semibold h-10 text-[13px]"
                >
                  Cari Peminjaman
                </Button>
              </div>
            </div>
          )}

          {step === 2 && lookupResult && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white border-2 border-[#1E293B] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                  <h2 className="font-bold text-[15px] text-[#0F172A]">Verifikasi Barang</h2>
                  <span className="text-[11px] font-mono font-bold bg-[#F1F5F9] px-2 py-1 rounded border border-[#E2E8F0]">{uniqueCode.toUpperCase()}</span>
                </div>
                <div className="p-6">
                  <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0] space-y-2 mb-6 text-[13px]">
                    <div className="flex justify-between"><span className="text-[#64748B]">Barang</span><span className="font-semibold text-[#0F172A]">{lookupResult.item.name}</span></div>
                    <div className="flex justify-between"><span className="text-[#64748B]">Brand</span><span className="font-semibold text-[#0F172A]">{lookupResult.item.brand}</span></div>
                    <div className="flex justify-between"><span className="text-[#64748B]">Lokasi</span><span className="font-semibold text-[#0F172A]">{lookupResult.item.location}</span></div>
                    <div className="flex justify-between"><span className="text-[#64748B]">Peminjam</span><span className="font-semibold text-[#0F172A]">{lookupResult.borrowing.borrowerName}</span></div>
                    <div className="flex justify-between"><span className="text-[#64748B]">Jumlah</span><span className="font-semibold text-[#0F172A]">{lookupResult.borrowing.quantity} unit</span></div>
                  </div>

                  <Label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 block">Foto Pengembalian</Label>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageCapture} />
                  {imagePreview ? (
                    <div className="relative mb-4">
                      <img src={imagePreview} alt="Preview" className="w-full rounded-lg border-2 border-[#E2E8F0] object-cover max-h-48" />
                      <Button variant="secondary" size="sm" className="absolute top-2 right-2 bg-white/90 border-2 border-[#E2E8F0]" onClick={() => setImagePreview(null)}>
                        Hapus
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-[#CBD5E1] rounded-xl p-8 text-center hover:bg-[#F8FAFC] transition-colors mb-4"
                    >
                      <Search className="mx-auto h-8 w-8 text-[#CBD5E1] mb-2" />
                      <p className="text-[13px] font-semibold text-[#475569]">Foto barang saat dikembalikan</p>
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setStep(1); setLookupResult(null); setError(""); }} className="bg-[#F1F5F9] border-2 border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#475569] rounded-lg font-semibold h-9 px-4 text-[13px]">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                    </Button>
                    <Button onClick={handleSubmitReturn} disabled={!imagePreview || submitting} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-semibold h-9 px-4 text-[13px]">
                      {submitting ? "Mengirim..." : "Kirim Pengembalian"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
