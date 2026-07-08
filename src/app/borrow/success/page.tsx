import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BorrowSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-5xl mb-4">✅</div>
          <CardTitle className="text-xl text-emerald-700">Success!</CardTitle>
          <CardDescription className="mt-2">
            Your borrowing request is being processed.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
