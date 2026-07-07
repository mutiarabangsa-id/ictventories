"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronRight, CheckCircle2 } from "lucide-react";

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
  { key: "all", label: "Semua" },
  { key: "hardware", label: "Hardware" },
  { value: "consumable", label: "Consumable" },
  { key: "tools", label: "Tools" },
];

const catClass: Record<string, string> = {
  hardware: "bg-blue-100 text-blue-800",
  consumable: "bg-amber-100 text-amber-800",
  tools: "bg-emerald-100 text-emerald-800",
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
  const [category, setCategory] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
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
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-[#1E293B] rounded-xl p-8 w-full max-w-md text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
          <h2 className="text-xl font-bold text-[#0F172A]">Peminjaman Diajukan</h2>
          <p className="text-sm text-[#475569] mt-1 mb-6">Menunggu persetujuan admin</p>
          <div className="bg-[#F1F5F9] rounded-lg p-4 border border-[#E2E8F0]">
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Kode Unik</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-[#0F172A]">{uniqueCode}</p>
          </div>
          <p className="text-xs text-[#64748B] mt-4">Simpan kode ini untuk pengembalian barang</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-[#E2E8F0] bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center text-white font-bold text-sm">MB</div>
            <span className="font-bold text-[#0F172A]">ICT Inventory</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <span className="font-semibold text-[#0F172A] bg-[#DBEAFE] text-[#1E40AF] px-3 py-1 rounded-md">1 Pilih Barang</span>
            <ChevronRight className="h-3 w-3 text-[#CBD5E1]" />
            <span className="text-[#94A3B8]">2 Data Diri</span>
            <ChevronRight className="h-3 w-3 text-[#CBD5E1]" />
            <span className="text-[#94A3B8]">3 Foto</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-[#E2E8F0] bg-white px-6 py-3 flex items-center gap-3">
          <span className="font-bold text-[13px] text-[#0F172A]">Barang</span>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              className="w-full h-8 pl-9 pr-3 text-[13px] border-2 border-[#E2E8F0] rounded-lg focus:border-[#2563EB] outline-none"
              placeholder="Cari barang atau brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {CATEGORIES.map((c) => {
              const key = "key" in c ? c.key : "value" in c ? (c as any).value : "all";
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-semibold border-2 transition-colors ${
                    category === key
                      ? "bg-[#0F172A] text-white border-[#0F172A]"
                      : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-[#E2E8F0] gap-px border-b border-[#E2E8F0]">
          {filtered.map((item) => {
            const ratio = item.quantity > 0 ? item.availableQty / item.quantity : 0;
            const barColor = ratio > 0.5 ? "#10B981" : ratio > 0.2 ? "#F59E0B" : "#EF4444";
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setPanelOpen(true);
                }}
                className={`text-left bg-white p-5 transition-colors relative ${
                  selectedItem?.id === item.id ? "bg-[#F0F4FF]" : "hover:bg-[#F8FAFC]"
                }`}
              >
                {selectedItem?.id === item.id && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2563EB]" />}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${catClass[item.category] || "bg-slate-100 text-slate-600"}`}>
                    {item.category}
                  </span>
                  <span className="text-[11px] font-bold text-[#10B981]">{item.availableQty} tersedia</span>
                </div>
                <h3 className="font-bold text-[14px] text-[#0F172A] mb-3 leading-snug">{item.name}</h3>
                <div className="flex flex-wrap gap-3 text-[11px] text-[#64748B] mb-3">
                  <span>{item.brand}</span>
                  <span>{item.location}</span>
                  <span className="font-mono font-semibold">{item.availableQty}/{item.quantity}</span>
                </div>
                <div className="h-1 bg-[#F1F5F9] rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${ratio * 100}%`, background: barColor }} />
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#94A3B8] bg-white">
              Tidak ada barang ditemukan
            </div>
          )}
        </div>

        {/* Bottom Sheet Panel */}
        {panelOpen && selectedItem && (
          <div className="border-t-2 border-[#1E293B] bg-white">
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#E2E8F0]">
              <span className="font-bold text-[15px] text-[#0F172A]">Pinjam — {selectedItem.name}</span>
              <button
                onClick={() => setPanelOpen(false)}
                className="w-7 h-7 rounded-md border-2 border-[#E2E8F0] flex items-center justify-center text-[12px] text-[#64748B] hover:bg-[#F1F5F9]"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-5 p-6">
              {/* Form */}
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 block">Jenis</Label>
                  <div className="flex gap-2">
                    {BORROWER_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setBorrowerType(t.value)}
                        className={`px-4 py-2 rounded-lg text-[12px] font-semibold border-2 transition-colors ${
                          borrowerType === t.value
                            ? "bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB]"
                            : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 block">Nama Lengkap</Label>
                  <Input className="h-9 text-[13px] border-2 border-[#E2E8F0] focus:border-[#2563EB]" placeholder="Masukkan nama" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 block">Email</Label>
                    <Input className="h-9 text-[13px] border-2 border-[#E2E8F0] focus:border-[#2563EB]" type="email" placeholder="email@sekolah.sch.id" value={borrowerEmail} onChange={(e) => setBorrowerEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 block">No. WA</Label>
                    <Input className="h-9 text-[13px] border-2 border-[#E2E8F0] focus:border-[#2563EB]" placeholder="08xxxxxxxxxx" value={borrowerPhone} onChange={(e) => setBorrowerPhone(e.target.value)} />
                  </div>
                </div>
                <div className="w-32">
                  <Label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 block">Jumlah</Label>
                  <Input className="h-9 text-[13px] border-2 border-[#E2E8F0] focus:border-[#2563EB]" type="number" min={1} max={selectedItem.availableQty} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setPanelOpen(false)} className="bg-[#F1F5F9] border-2 border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#475569] rounded-lg font-semibold h-9 px-4 text-[13px]">
                    Batal
                  </Button>
                  <Button
                    onClick={() => { setStep(3); setPanelOpen(false); }}
                    disabled={!borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone}
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-semibold h-9 px-4 text-[13px]"
                  >
                    Selanjutnya →
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="w-full md:w-56 bg-[#F8FAFC] rounded-xl border-2 border-[#E2E8F0] p-4 h-fit">
                <p className="font-bold text-[13px] text-[#0F172A] mb-3">Ringkasan</p>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between"><span className="text-[#64748B]">Barang</span><span className="font-semibold text-[#0F172A]">{selectedItem.name}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Brand</span><span className="font-semibold text-[#0F172A]">{selectedItem.brand}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Lokasi</span><span className="font-semibold text-[#0F172A]">{selectedItem.location}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Tersedia</span><span className="font-semibold text-[#0F172A]">{selectedItem.availableQty} unit</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photo (inline) */}
        {step === 3 && selectedItem && (
          <div className="border-t-2 border-[#1E293B] bg-white px-6 py-5">
            <h3 className="font-bold text-[15px] text-[#0F172A] mb-1">Foto</h3>
            <p className="text-[13px] text-[#64748B] mb-4">Foto barang atau selfie pegang barang sebagai bukti</p>
            <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageCapture} />
            {imagePreview ? (
              <div className="relative mb-4 max-w-md">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg border-2 border-[#E2E8F0] object-cover max-h-60" />
                <Button variant="secondary" size="sm" className="absolute top-2 right-2 bg-white/90 border-2 border-[#E2E8F0]" onClick={() => setImagePreview(null)}>
                  Hapus
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md border-2 border-dashed border-[#CBD5E1] rounded-xl p-10 text-center hover:bg-[#F8FAFC] transition-colors mb-4"
              >
                <Search className="mx-auto h-8 w-8 text-[#CBD5E1] mb-2" />
                <p className="text-[13px] font-semibold text-[#475569]">Klik untuk ambil foto</p>
                <p className="text-[11px] text-[#94A3B8] mt-1">Kamera akan terbuka otomatis</p>
              </button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="bg-[#F1F5F9] border-2 border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#475569] rounded-lg font-semibold h-9 px-4 text-[13px]">
                Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={!imagePreview || submitting} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-semibold h-9 px-4 text-[13px]">
                {submitting ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
