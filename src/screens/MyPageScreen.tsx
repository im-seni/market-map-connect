import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";

const rows: { to: string; ko: string; en: string }[] = [
  { to: "/my/payment", ko: "결제 수단", en: "Payment" },
  { to: "/my/language", ko: "언어", en: "Language" },
];

export default function MyPageScreen() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
        <div className="rounded-card border border-border p-g5 shadow-elevate-sm">
          <p className="type-caption text-muted-foreground">프로필 · Profile</p>
          <p className="type-title mt-g2">게스트 · Guest</p>
          <p className="type-body text-muted-foreground mt-g2">
            저장한 상점 · Saved vendors · 방문 기록 · Visit history (프로토타입)
          </p>
        </div>
        <div className="rounded-card border border-border divide-y divide-border shadow-elevate-sm overflow-hidden">
          {rows.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="flex items-center justify-between px-g4 py-g4 type-body font-medium hover:bg-secondary/80"
            >
              <span>
                {r.ko} · {r.en}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
