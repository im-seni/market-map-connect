import { Check } from "lucide-react";
import { useState } from "react";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { cn } from "@/lib/utils";

const methods = [
  { id: "card", ko: "신용·체크카드", en: "Card" },
  { id: "kakao", ko: "카카오페이", en: "KakaoPay" },
  { id: "naver", ko: "네이버페이", en: "NaverPay" },
  { id: "toss", ko: "토스페이", en: "TossPay" },
  { id: "apple", ko: "Apple Pay (선택)", en: "Apple Pay (optional)" },
  { id: "cash", ko: "현장 현금", en: "Cash on-site" },
] as const;

export default function PaymentMethodsScreen() {
  const [sel, setSel] = useState<string>("card");

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title="결제 수단 · Payment methods" />
      <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g3">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSel(m.id)}
            className={cn(
              "w-full flex items-center justify-between rounded-card border p-g4 shadow-elevate-sm transition",
              sel === m.id ? "border-brand-royal bg-brand-royal/5" : "border-border bg-card"
            )}
          >
            <span className="type-body font-medium text-left">
              {m.ko} · {m.en}
            </span>
            {sel === m.id && <Check className="h-5 w-5 text-brand-royal" />}
          </button>
        ))}
      </div>
    </PhoneFrame>
  );
}
