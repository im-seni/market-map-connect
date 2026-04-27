import { StackHeader } from "@/components/app/StackHeader";

const faqs: { q: string; qEn: string; a: string; aEn: string }[] = [
  {
    q: "야시장은 언제 열리나요?",
    qEn: "When is the night market open?",
    a: "매주 금·토·일 저녁 6시부터 11시까지 운영됩니다.",
    aEn: "Every Fri–Sun, 6 PM to 11 PM.",
  },
  {
    q: "쿠폰은 어디서 사용하나요?",
    qEn: "Where can I use coupons?",
    a: "참여 상점에서 결제 시 QR을 보여주세요.",
    aEn: "Show the QR at checkout in participating vendors.",
  },
  {
    q: "주차장이 있나요?",
    qEn: "Is there parking?",
    a: "근처 공영주차장을 이용해 주세요.",
    aEn: "Please use the nearby public parking lot.",
  },
];

export default function FAQScreen() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <StackHeader title="자주 묻는 질문 · FAQ" />
      <div className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-card border border-border bg-card p-g4 shadow-elevate-sm">
            <p className="type-body font-semibold text-foreground">
              Q. {f.q}
            </p>
            <p className="type-caption text-muted-foreground mt-g1">{f.qEn}</p>
            <p className="type-body text-foreground mt-g3">{f.a}</p>
            <p className="type-caption text-muted-foreground mt-g1">{f.aEn}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
