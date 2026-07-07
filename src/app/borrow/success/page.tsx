import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BorrowSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-5xl mb-4">✅</div>
          <CardTitle className="text-xl text-emerald-700">Berhasil!</CardTitle>
          <CardDescription className="mt-2">
            Pengajuan peminjaman Anda sedang diproses.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
