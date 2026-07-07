"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Package, MapPin, Hash, ChevronLeft, ChevronRight } from "lucide-react";

interface Item {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  availableQty: number;
  location: string;
  imageUrl: string | null;
}

const BORROWER_TYPES = [
  { value: "guru", label: "Guru" },
  { value: "staff", label: "Staff" },
  { value: "murid", label: "Murid" },
];

const CATEGORIES = [
  { key: "all", label: "Semua", icon: "📦" },
  { key: "hardware", label: "Hardware", icon: "💻" },
  { key: "consumable", label: "Consumable", icon: "🔧" },
  { key: "tools", label: "Tools", icon: "🛠️" },
];

const categoryColors: Record<string, string> = {
  hardware: "bg-blue-100 text-blue-700",
  consumable: "bg-amber-100 text-amber-700",
  tools: "bg-emerald-100 text-emerald-700",
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
  const [activeCategory, setActiveCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/borrow")
      .then((res) => res.json())
      .then((data) => setItems(data.items));
  }, []);

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "all" || item.category === activeCategory;
    return matchSearch && matchCategory && item.availableQty > 0;
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <div className="text-6xl mb-4">✅</div>
            <CardTitle className="text-2xl text-emerald-700">Peminjaman Diajukan!</CardTitle>
            <CardDescription className="text-base mt-2">
              Menunggu persetujuan admin
            </CardDescription>
            <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-600 mb-2">Kode Unik Anda</p>
              <div className="text-4xl font-mono font-bold text-blue-600 tracking-widest">
                {uniqueCode}
              </div>
            </div>
            <CardDescription className="text-sm mt-4 text-gray-500">
              Simpan kode ini! Dibutuhkan saat pengembalian barang.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 tracking-tight"
          >
            Peminjaman Barang ICT
          </motion.h1>
          <p className="text-gray-500 mt-2 text-base">
            Pilih barang yang ingin Anda pinjam dari daftar di bawah
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: step === s ? 1.1 : 1 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step >= s
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </motion.div>
                {s < 3 && (
                  <div
                    className={`w-16 h-0.5 transition-colors ${
                      step > s ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT ITEM */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Search + Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari barang atau brand..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat.key
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg">Tidak ada barang ditemukan</p>
                  <p className="text-gray-400 text-sm mt-1">Coba kata kunci lain atau ubah filter</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item, i) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setSelectedItem(item);
                        setStep(2);
                      }}
                      className="group text-left bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all duration-200"
                    >
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            categoryColors[item.category] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {item.availableQty} tersedia
                        </span>
                      </div>

                      {/* Item Name */}
                      <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                        {item.name}
                      </h3>

                      {/* Metadata */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Package className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{item.brand}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Stok total: {item.quantity}</span>
                        </div>
                      </div>

                      {/* Stock Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              item.availableQty / item.quantity > 0.5
                                ? "bg-emerald-500"
                                : item.availableQty / item.quantity > 0.2
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${(item.availableQty / item.quantity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: FILL DETAILS */}
          {step === 2 && selectedItem && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Isi Data Diri</CardTitle>
                      <CardDescription className="mt-1">
                        Barang: <span className="font-semibold text-gray-700">{selectedItem.name}</span> — {selectedItem.brand}
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ubah Barang
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Jenis</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {BORROWER_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setBorrowerType(t.value)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            borrowerType === t.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nama Lengkap</Label>
                    <Input placeholder="Masukkan nama lengkap" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input type="email" placeholder="email@sekolah.sch.id" value={borrowerEmail} onChange={(e) => setBorrowerEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">No. WA</Label>
                    <Input placeholder="08xxxxxxxxxx" value={borrowerPhone} onChange={(e) => setBorrowerPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Jumlah</Label>
                    <Input type="number" min={1} max={selectedItem.availableQty} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone}
                      className="flex-1"
                    >
                      Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: PHOTO */}
          {step === 3 && selectedItem && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Upload Foto</CardTitle>
                  <CardDescription>Foto barang atau selfie pegang barang sebagai bukti</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full rounded-2xl object-cover max-h-80" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur"
                        onClick={() => setImagePreview(null)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-5xl mb-3">📷</div>
                      <p className="text-gray-700 font-medium text-lg">Klik untuk ambil foto</p>
                      <p className="text-sm text-gray-400 mt-1">Kamera akan terbuka secara otomatis</p>
                    </button>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                    </Button>
                    <Button onClick={handleSubmit} disabled={!imagePreview || submitting} className="flex-1">
                      {submitting ? "Mengirim..." : "Kirim Peminjaman"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
