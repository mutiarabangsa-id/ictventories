"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, X, ShoppingCart, ChevronRight, CheckCircle2, Camera } from "lucide-react";

interface Item {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  availableQty: number;
  location: string;
}

interface CartItem {
  item: Item;
  borrowerType: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  quantity: number;
}

const BORROWER_TYPES = [
  { value: "guru", label: "Teacher" },
  { value: "staff", label: "Staff" },
  { value: "murid", label: "Student" },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "hardware", label: "Hardware" },
  { key: "consumable", label: "Consumable" },
  { key: "tools", label: "Tools" },
];

const catVariant: Record<string, "default" | "warning" | "success"> = {
  hardware: "default",
  consumable: "warning",
  tools: "success",
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/borrow")
      .then((r) => r.json())
      .then((d) => setItems(d.items));
  }, []);

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q);
    const matchCat = category === "all" || i.category === category;
    return matchSearch && matchCat && i.availableQty > 0;
  });

  const openSidebar = (item: Item) => {
    setSelectedItem(item);
    setBorrowerType("");
    setBorrowerName("");
    setBorrowerEmail("");
    setBorrowerPhone("");
    setQuantity(1);
    setSidebarOpen(true);
  };

  const addToCart = () => {
    if (!selectedItem || !borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone)
      return;
    setCart((prev) => [
      ...prev,
      {
        item: selectedItem,
        borrowerType,
        borrowerName,
        borrowerEmail,
        borrowerPhone,
        quantity,
      },
    ]);
    setSidebarOpen(false);
  };

  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBulkSubmit = async () => {
    if (!imagePreview || cart.length === 0) return;
    setSubmitting(true);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });
      const { url } = await uploadRes.json();

      for (const entry of cart) {
        await fetch("/api/borrow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            borrowerName: entry.borrowerName,
            borrowerType: entry.borrowerType,
            borrowerEmail: entry.borrowerEmail,
            borrowerPhone: entry.borrowerPhone,
            itemId: entry.item.id,
            quantity: entry.quantity,
            borrowImageUrl: url,
          }),
        });
      }
      setSuccess(true);
    } catch {
      alert("Failed to submit borrowing");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-[#05b169]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-7 w-7 text-[#05b169]" />
          </div>
          <h2 className="text-2xl font-light text-[#0a0b0d] mb-2">Borrowing Submitted</h2>
          <p className="text-[#5b616e] mb-1">Awaiting admin approval</p>
          <p className="text-sm text-[#7c828a]">{cart.length} items submitted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#dee1e6] h-16">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a0b0d] rounded-lg flex items-center justify-center text-white font-semibold text-xs">
              MB
            </div>
            <span className="text-sm font-medium text-[#0a0b0d] hidden sm:inline">
              ICT Inventory
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#0a0b0d] font-medium">Select Item</span>
            <ChevronRight className="h-3 w-3 text-[#dee1e6]" />
            <span className="text-[#7c828a]">Personal Info</span>
            <ChevronRight className="h-3 w-3 text-[#dee1e6]" />
            <span className="text-[#7c828a]">Foto</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="border-b border-[#dee1e6]">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7c828a]" />
            <input
              className="w-full h-12 pl-11 pr-4 text-sm bg-[#eef0f3] rounded-full outline-none focus:ring-2 focus:ring-[#0052ff] transition-all placeholder:text-[#7c828a]"
              placeholder="Search item or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === c.key
                    ? "bg-[#0a0b0d] text-white"
                    : "bg-[#eef0f3] text-[#5b616e] hover:bg-[#dee1e6]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Item Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const ratio = item.quantity > 0 ? item.availableQty / item.quantity : 0;
            const barColor =
              ratio > 0.5 ? "#05b169" : ratio > 0.2 ? "#f4b000" : "#cf202f";
            return (
              <button
                key={item.id}
                onClick={() => openSidebar(item)}
                className="text-left bg-white rounded-[24px] border border-[#dee1e6] p-6 hover:border-[#0052ff] transition-all hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={catVariant[item.category] || "default"}>
                    {item.category}
                  </Badge>
                  <span className="text-xs font-medium text-[#05b169]">
                    {item.availableQty} available
                  </span>
                </div>
                <h3 className="text-base font-medium text-[#0a0b0d] mb-3 leading-snug">
                  {item.name}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#5b616e] mb-4">
                  <span>{item.brand}</span>
                  <span>{item.location}</span>
                  <span className="font-mono">
                    {item.availableQty}/{item.quantity}
                  </span>
                </div>
                <div className="h-1.5 bg-[#eef0f3] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${ratio * 100}%`, background: barColor }}
                  />
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-[#7c828a]">
              No items found
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-sm transition-all hover:scale-105"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-white text-[#0052ff] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {cart.length}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowCart(false)} />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto rounded-tl-[24px] rounded-bl-[24px]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#dee1e6]">
              <h3 className="text-lg font-medium text-[#0a0b0d]">
                Cart ({cart.length})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded-full bg-[#eef0f3] flex items-center justify-center text-[#5b616e] hover:bg-[#dee1e6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {cart.map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded-[16px] border border-[#dee1e6] p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-[#0a0b0d] pr-2">
                      {entry.item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-[#7c828a] hover:text-[#cf202f] flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-[#5b616e] space-y-1">
                    <p>
                      {entry.borrowerName} ({entry.borrowerType})
                    </p>
                    <p>
                      Quantity:{" "}
                      <span className="font-medium text-[#0a0b0d]">
                        {entry.quantity} unit
                      </span>
                    </p>
                    <p className="truncate">{entry.borrowerEmail}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#dee1e6] space-y-4">
                <p className="text-sm text-[#5b616e]">
                  Take a selfie holding the item as proof
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleImageCapture}
                />
                {imagePreview ? (
                  <div className="relative rounded-[16px] overflow-hidden border border-[#dee1e6]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full object-cover max-h-40"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={() => setImagePreview(null)}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#dee1e6] rounded-[16px] p-8 text-center hover:bg-[#f7f7f7] transition-colors"
                  >
                    <Camera className="mx-auto h-6 w-6 text-[#dee1e6] mb-2" />
                    <p className="text-sm font-medium text-[#5b616e]">Take Photo</p>
                  </button>
                )}
                <Button
                  onClick={handleBulkSubmit}
                  disabled={!imagePreview || submitting}
                  className="w-full rounded-full h-12 text-base"
                >
                  {submitting ? "Submitting..." : "Submit All"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Panel - Detail Pinjam */}
      {sidebarOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto rounded-tl-[24px] rounded-bl-[24px]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#dee1e6]">
              <div>
                <h3 className="text-lg font-medium text-[#0a0b0d]">Borrow Item</h3>
                <p className="text-sm text-[#5b616e] mt-0.5">{selectedItem.name}</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-[#eef0f3] flex items-center justify-center text-[#5b616e] hover:bg-[#dee1e6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Summary */}
            <div className="px-6 py-6 border-b border-[#dee1e6] bg-[#f7f7f7]">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5b616e]">Item</span>
                  <span className="font-medium text-[#0a0b0d]">{selectedItem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5b616e]">Brand</span>
                  <span className="font-medium text-[#0a0b0d]">{selectedItem.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5b616e]">Location</span>
                  <span className="font-medium text-[#0a0b0d]">{selectedItem.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5b616e]">Available</span>
                  <span className="font-medium text-[#0a0b0d]">
                    {selectedItem.availableQty} unit
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-6 space-y-5">
              <div>
                <Label className="text-xs font-medium text-[#5b616e] mb-2 block">
                  Borrower Type
                </Label>
                <div className="flex gap-2">
                  {BORROWER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setBorrowerType(t.value)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                        borrowerType === t.value
                          ? "bg-[#0a0b0d] text-white"
                          : "bg-[#eef0f3] text-[#5b616e] hover:bg-[#dee1e6]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-[#5b616e] mb-2 block">
                  Full Name
                </Label>
                <Input
                  placeholder="Enter your name"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-[#5b616e] mb-2 block">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="email@sekolah.sch.id"
                  value={borrowerEmail}
                  onChange={(e) => setBorrowerEmail(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-[#5b616e] mb-2 block">
                  No. WA
                </Label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  value={borrowerPhone}
                  onChange={(e) => setBorrowerPhone(e.target.value)}
                />
              </div>
              <div className="w-32">
                <Label className="text-xs font-medium text-[#5b616e] mb-2 block">
                  Quantity
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={selectedItem.availableQty}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSidebarOpen(false)}
                  className="flex-1 rounded-full h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addToCart}
                  disabled={
                    !borrowerType || !borrowerName || !borrowerEmail || !borrowerPhone
                  }
                  className="flex-1 rounded-full h-11"
                >
                  + Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
