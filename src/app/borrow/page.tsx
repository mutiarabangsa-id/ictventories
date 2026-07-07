"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Item {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  availableQty: number;
}

const BORROWER_TYPES = [
  { value: "guru", label: "Guru" },
  { value: "staff", label: "Staff" },
  { value: "murid", label: "Murid" },
];

export default function BorrowPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [borrowerType, setBorrowerType] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerEmail, setBorrowerEmail] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uniqueCode, setUniqueCode] = useState("");
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/borrow")
      .then((res) => res.json())
      .then((data) => setItems(data.items));
  }, []);

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

  const handleSubmit = async () => {
    if (!selectedItem || !borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone || !imagePreview) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });
      const { url } = await res.json();

      const borrowRes = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName,
          borrowerType,
          borrowerEmail,
          borrowerPhone,
          itemId: selectedItem.id,
          quantity,
          borrowImageUrl: url,
        }),
      });
      const data = await borrowRes.json();
      if (data.success) {
        setUniqueCode(data.uniqueCode);
        setSuccess(true);
      }
    } catch {
      alert("Gagal mengajukan peminjaman");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-5xl mb-4">✅</div>
            <CardTitle className="text-xl text-emerald-700">Peminjaman Diajukan!</CardTitle>
            <CardDescription className="text-base mt-2">
              Menunggu persetujuan admin. Kode unik Anda:
            </CardDescription>
            <div className="text-3xl font-mono font-bold text-blue-600 tracking-widest bg-blue-50 p-4 rounded-xl mt-2">
              {uniqueCode}
            </div>
            <CardDescription className="text-sm mt-4">
              Simpan kode ini! Anda akan membutuhkannya saat mengembalikan barang.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📋 Peminjaman Barang ICT</h1>
          <p className="text-gray-500 mt-1">Isi form di bawah untuk meminjam barang</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Item */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Pilih Barang</CardTitle>
              <CardDescription>Pilih barang yang ingin Anda pinjam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {items.filter(i => i.availableQty > 0).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setStep(2); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedItem?.id === item.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.brand} • {item.category}</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {item.availableQty} tersedia
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Fill Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Isi Data Diri</CardTitle>
              <CardDescription>Barang: {selectedItem?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BORROWER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setBorrowerType(t.value)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${borrowerType === t.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input placeholder="Masukkan nama" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@sekolah.sch.id" value={borrowerEmail} onChange={(e) => setBorrowerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>No. WA</Label>
                <Input placeholder="08xxxxxxxxxx" value={borrowerPhone} onChange={(e) => setBorrowerPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input type="number" min={1} max={selectedItem?.availableQty} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Kembali</Button>
                <Button onClick={() => setStep(3)} disabled={!borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone} className="flex-1">Selanjutnya</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Photo */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Foto</CardTitle>
              <CardDescription>Foto barang atau selfie pegang barang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageCapture} />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover max-h-80" />
                  <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setImagePreview(null)}>Hapus</Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-600 font-medium">Klik untuk ambil foto</p>
                  <p className="text-sm text-gray-400">Kamera akan terbuka secara otomatis</p>
                </button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Kembali</Button>
                <Button onClick={handleSubmit} disabled={!imagePreview || submitting} className="flex-1">
                  {submitting ? "Mengirim..." : "Kirim"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
