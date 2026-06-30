import { Card } from "@/components/ui/Card";
import { ResendVerificationForm } from "@/components/layout/ResendVerificationForm";

export default function ResendVerificationPage() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">القافلة</h1>
        <p className="mt-2 text-muted-fg text-sm">إعادة إرسال رسالة التحقق</p>
      </div>
      <Card>
        <ResendVerificationForm />
      </Card>
    </div>
  );
}
