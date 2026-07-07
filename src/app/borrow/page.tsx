"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, MapPin, Hash, Package, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

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

const categoryBadgeClass: Record<string, string> = {
  hardware: "bg-blue-50 text-blue-700 border-blue-200",
  consumable: "bg-amber-50 text-amber-700 border-amber-200",
  tools: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/borrow")
      .then((res) => res.json())
      .then((data) => setItems(data.items));
  }, []);

  const filterItems = (category: string) =>
    items.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
      const matchCat = category === "all" || item.category === category;
      return matchSearch && matchCat && item.availableQty > 0;
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <CardTitle className="text-xl mt-2">Peminjaman Diajukan</CardTitle>
            <CardDescription>Menunggu persetujuan admin</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Kode unik Anda</p>
            <p className="text-3xl font-mono font-bold tracking-widest">{uniqueCode}</p>
            <p className="text-xs text-muted-foreground mt-4">Simpan kode ini untuk pengembalian barang</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Peminjaman Barang ICT</h1>
          <p className="text-muted-foreground mt-1">Pilih barang yang ingin Anda pinjam</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {["Pilih Barang", "Data Diri", "Foto"].map((label, i) => {
            const n = i + 1;
            return (
              <div key={n} className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {n}
                </span>
                <span className={step >= n ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {label}
                </span>
                {i < 2 && <span className="text-muted-foreground mx-1">/</span>}
              </div>
            );
          })}
        </div>

        {/* STEP 1: SELECT ITEM */}
        {step === 1 && (
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama barang atau brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tabs for category filter */}
            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="hardware">Hardware</TabsTrigger>
                <TabsTrigger value="consumable">Consumable</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              {["all", "hardware", "consumable", "tools"].map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filterItems(cat).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setStep(2);
                        }}
                        className="text-left rounded-lg border p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm leading-snug">{item.name}</h3>
                          <Badge variant="outline" className={`text-[10px] ml-2 shrink-0 ${categoryBadgeClass[item.category] || ""}`}>
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                    {filterItems(cat).length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-full py-8 text-center">Tidak ada barang ditemukan</p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* STEP 2: FILL DETAILS */}
        {step === 2 && selectedItem && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Diri</CardTitle>
                  <CardDescription>{selectedItem.name} — {selectedItem.brand}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Ubah
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BORROWER_TYPES.map((t) => (
                    <Button
                      key={t.value}
                      variant={borrowerType === t.value ? "default" : "outline"}
                      onClick={() => setBorrowerType(t.value)}
                    >
                      {t.label}
                    </Button>
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
                <Input type="number" min={1} max={selectedItem.availableQty} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone}
                  className="flex-1"
                >
                  Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: PHOTO */}
        {step === 3 && selectedItem && (
          <Card>
            <CardHeader>
              <CardTitle>Foto</CardTitle>
              <CardDescription>Foto barang atau selfie pegang barang sebagai bukti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageCapture} />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover max-h-80" />
                  <Button variant="secondary" size="sm" className="absolute top-2 right-2" onClick={() => setImagePreview(null)}>
                    Hapus
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed rounded-lg p-12 text-center hover:bg-accent transition-colors"
                >
                  <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Klik untuk ambil foto</p>
                  <p className="text-xs text-muted-foreground mt-1">Kamera akan terbuka secara otomatis</p>
                </button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
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
