import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PaymentMethodsScreen() {
  const { primary } = useLanguage();

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title={primary("결제 수단", "Payment methods")} />
      <div className="flex flex-1 flex-col items-center justify-center px-g6 py-g8 text-center">
        <p className="type-title text-foreground">
          {primary("준비 중", "Coming soon")}
        </p>
        <p className="type-body text-muted-foreground mt-g3 text-pretty max-w-sm">
          {primary(
            "결제 수단 등록 기능을 준비하고 있어요.",
            "We’re working on saved payment methods.",
          )}
        </p>
      </div>
    </PhoneFrame>
  );
}
