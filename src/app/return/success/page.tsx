import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReturnSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-5xl mb-4">🎉</div>
          <CardTitle className="text-xl text-emerald-700">Pengembalian Diajukan!</CardTitle>
          <CardDescription className="mt-2">
            Admin akan memverifikasi pengembalian Anda.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
