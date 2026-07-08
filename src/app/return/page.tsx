"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronLeft, Camera } from "lucide-react";

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
        setError(data.error || "Unique code not found");
      }
    } catch {
      setError("Something went wrong. Try again.");
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
        body: JSON.stringify({
          uniqueCode: uniqueCode.toUpperCase(),
          returnImageUrl: url,
          action: "submit_return",
        }),
      });
      const data = await returnRes.json();
      if (data.success) setSuccess(true);
      else       setError("Failed to submit return");
    } catch {
      setError("Something went wrong. Try again.");
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
          <h2 className="text-2xl font-light text-[#0a0b0d] mb-2">
            Return Submitted
          </h2>
          <p className="text-[#5b616e]">Admin will verify your return</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#dee1e6] h-16">
        <div className="max-w-4xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a0b0d] rounded-lg flex items-center justify-center text-white font-semibold text-xs">
              MB
            </div>
            <span className="text-sm font-medium text-[#0a0b0d]">ICT Inventory</span>
          </div>
          <span className="text-sm font-medium text-[#0a0b0d]">Return Item</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-16">
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-3xl font-light text-[#0a0b0d] mb-3">
              Return Item
            </h2>
            <p className="text-[#5b616e] mb-10">
              Enter the 6-character code you received when borrowing
            </p>
            <div className="mb-6">
              <Input
                className="h-14 text-center text-2xl tracking-[0.3em] font-mono uppercase"
                placeholder="ABC123"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            {error && (
              <div className="bg-[#cf202f]/5 text-[#cf202f] text-sm p-4 rounded-[16px] mb-6">
                {error}
              </div>
            )}
            <Button
              onClick={handleLookup}
              disabled={uniqueCode.length < 6}
              className="w-full rounded-full h-12 text-base"
            >
              Find Borrowing
            </Button>
          </div>
        )}

        {step === 2 && lookupResult && (
          <div>
            <div className="rounded-[24px] border border-[#dee1e6] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#dee1e6] flex items-center justify-between">
                <h2 className="text-base font-medium text-[#0a0b0d]">
                  Verify Item
                </h2>
                <Badge variant="outline" className="font-mono">
                  {uniqueCode.toUpperCase()}
                </Badge>
              </div>
              <div className="p-6 space-y-6">
                <div className="rounded-[16px] bg-[#f7f7f7] p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5b616e]">Item</span>
                    <span className="font-medium text-[#0a0b0d]">
                      {lookupResult.item.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5b616e]">Brand</span>
                    <span className="font-medium text-[#0a0b0d]">
                      {lookupResult.item.brand}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5b616e]">Location</span>
                    <span className="font-medium text-[#0a0b0d]">
                      {lookupResult.item.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5b616e]">Borrower</span>
                    <span className="font-medium text-[#0a0b0d]">
                      {lookupResult.borrowing.borrowerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5b616e]">Quantity</span>
                    <span className="font-medium text-[#0a0b0d]">
                      {lookupResult.borrowing.quantity} unit
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-[#5b616e] mb-2 block">
                    Return Photo
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                  {imagePreview ? (
                    <div className="relative rounded-[16px] overflow-hidden border border-[#dee1e6] mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full object-cover max-h-48"
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
                      className="w-full border-2 border-dashed border-[#dee1e6] rounded-[16px] p-10 text-center hover:bg-[#f7f7f7] transition-colors mb-4"
                    >
                      <Camera className="mx-auto h-8 w-8 text-[#dee1e6] mb-2" />
                      <p className="text-sm font-medium text-[#5b616e]">
                        Photo of item upon return
                      </p>
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setLookupResult(null);
                      setError("");
                    }}
                    className="flex-1 rounded-full h-11"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmitReturn}
                    disabled={!imagePreview || submitting}
                    className="flex-1 rounded-full h-11"
                  >
                    {submitting ? "Submitting..." : "Submit Return"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
