"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, MapPin, Hash, Package, CheckCircle2, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Item {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  availableQty: number;
  location: string;
}

const BORROWER_TYPES = [
  { value: "guru", label: "Guru" },
  { value: "staff", label: "Staff" },
  { value: "murid", label: "Murid" },
];

const CATEGORIES = [
  { value: "all", label: "Semua Kategori" },
  { value: "hardware", label: "Hardware" },
  { value: "consumable", label: "Consumable" },
  { value: "tools", label: "Tools" },
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/borrow")
      .then((r) => r.json())
      .then((d) => setItems(d.items));
  }, []);

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q);
    const matchCat = category === "all" || i.category === category;
    return matchSearch && matchCat && i.availableQty > 0;
  });

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedItem || !borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone || !imagePreview) return;
    setSubmitting(true);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });
      const { url } = await uploadRes.json();
      const borrowRes = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowerName, borrowerType, borrowerEmail, borrowerPhone, itemId: selectedItem.id, quantity, borrowImageUrl: url }),
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
          <h2 className="text-xl font-bold">Peminjaman Diajukan</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Menunggu persetujuan admin</p>
          <div className="backdrop-blur-sm bg-white/50 rounded-xl p-4 border border-white/60">
            <p className="text-xs text-muted-foreground mb-1">Kode unik Anda</p>
            <p className="text-3xl font-mono font-bold tracking-widest">{uniqueCode}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Simpan kode ini untuk pengembalian barang</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl px-6 py-5 shadow-lg">
            <h1 className="text-2xl font-bold tracking-tight">Peminjaman Barang ICT</h1>
            <p className="text-sm text-muted-foreground mt-1">Pilih barang yang ingin Anda pinjam</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 text-sm mb-8 px-1">
          {["Pilih Barang", "Data Diri", "Foto"].map((label, i) => {
            const n = i + 1;
            const active = step >= n;
            return (
              <div key={n} className="flex items-center gap-1">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-white/40 text-muted-foreground border border-white/60"}`}>
                  {n}
                </span>
                <span className={active ? "font-medium" : "text-muted-foreground"}>
                  {label}
                </span>
                {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mx-1" />}
              </div>
            );
          })}
        </div>

        {/* STEP 1: SELECT ITEM */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Search + Filter Inline */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari barang atau brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 backdrop-blur-md bg-white/60 border-white/40"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  className="h-9 pl-9 pr-8 rounded-md border border-white/40 backdrop-blur-md bg-white/60 text-sm appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setStep(2); }}
                  className="text-left backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <h3 className="font-semibold text-sm leading-snug mb-3">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {item.brand}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {item.availableQty}/{item.quantity}
                    </span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full py-12 text-center backdrop-blur-md bg-white/40 rounded-xl">
                  Tidak ada barang ditemukan
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: FILL DETAILS */}
        {step === 2 && selectedItem && (
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg">
            <div className="px-6 py-5 border-b border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Data Diri</h2>
                  <p className="text-sm text-muted-foreground">{selectedItem.name} — {selectedItem.brand}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Ubah
                </Button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BORROWER_TYPES.map((t) => (
                    <Button key={t.value} variant={borrowerType === t.value ? "default" : "outline"} className={borrowerType !== t.value ? "backdrop-blur-sm bg-white/50 border-white/40" : ""} onClick={() => setBorrowerType(t.value)}>
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input placeholder="Masukkan nama" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} className="backdrop-blur-sm bg-white/50 border-white/40" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@sekolah.sch.id" value={borrowerEmail} onChange={(e) => setBorrowerEmail(e.target.value)} className="backdrop-blur-sm bg-white/50 border-white/40" />
              </div>
              <div className="space-y-2">
                <Label>No. WA</Label>
                <Input placeholder="08xxxxxxxxxx" value={borrowerPhone} onChange={(e) => setBorrowerPhone(e.target.value)} className="backdrop-blur-sm bg-white/50 border-white/40" />
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input type="number" min={1} max={selectedItem.availableQty} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="backdrop-blur-sm bg-white/50 border-white/40" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 backdrop-blur-sm bg-white/50 border-white/40">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <Button onClick={() => setStep(3)} disabled={!borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone} className="flex-1">
                  Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTO */}
        {step === 3 && selectedItem && (
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg">
            <div className="px-6 py-5 border-b border-white/30">
              <h2 className="font-semibold text-lg">Foto</h2>
              <p className="text-sm text-muted-foreground">Foto barang atau selfie pegang barang</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageCapture} />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover max-h-80" />
                  <Button variant="secondary" size="sm" className="absolute top-2 right-2 backdrop-blur-md bg-white/70" onClick={() => setImagePreview(null)}>
                    Hapus
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-white/60 backdrop-blur-sm bg-white/30 rounded-xl p-12 text-center hover:bg-white/50 transition-colors"
                >
                  <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Klik untuk ambil foto</p>
                  <p className="text-xs text-muted-foreground mt-1">Kamera akan terbuka otomatis</p>
                </button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 backdrop-blur-sm bg-white/50 border-white/40">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={!imagePreview || submitting} className="flex-1">
                  {submitting ? "Mengirim..." : "Kirim"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
