"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    borrowedAt: number;
  };
  item: {
    name: string;
    brand: string;
    category: string;
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
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
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
        body: JSON.stringify({
          uniqueCode: uniqueCode.toUpperCase(),
          returnImageUrl: url,
          action: "submit_return",
        }),
      });
      const data = await returnRes.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Gagal mengajukan pengembalian");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-5xl mb-4">🎉</div>
            <CardTitle className="text-xl text-emerald-700">Pengembalian Diajukan!</CardTitle>
            <CardDescription className="text-base mt-2">
              Admin akan memverifikasi pengembalian Anda.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🔄 Kembalikan Barang</h1>
          <p className="text-gray-500 mt-1">Masukkan kode unik Anda</p>
        </div>

        {/* Step 1: Input Code */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Masukkan Kode Unik</CardTitle>
              <CardDescription>Kode 6 karakter yang Anda terima saat peminjaman</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Unik</Label>
                <Input
                  placeholder="ABC123"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
              <Button onClick={handleLookup} disabled={uniqueCode.length < 6} className="w-full">
                Cari Peminjaman
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review & Photo */}
        {step === 2 && lookupResult && (
          <Card>
            <CardHeader>
              <CardTitle>Verifikasi Barang</CardTitle>
              <CardDescription>Pastikan data di bawah benar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Barang</span>
                  <span className="font-medium">{lookupResult.item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-medium">{lookupResult.item.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Peminjam</span>
                  <span className="font-medium">{lookupResult.borrowing.borrowerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah</span>
                  <span className="font-medium">{lookupResult.borrowing.quantity}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Foto Pengembalian</Label>
                <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageCapture} />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover max-h-60" />
                    <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setImagePreview(null)}>Hapus</Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors"
                  >
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-gray-600 font-medium">Foto barang saat dikembalikan</p>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setStep(1); setLookupResult(null); setError(""); }} className="flex-1">Kembali</Button>
                <Button onClick={handleSubmitReturn} disabled={!imagePreview || submitting} className="flex-1">
                  {submitting ? "Mengirim..." : "Kirim Pengembalian"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
