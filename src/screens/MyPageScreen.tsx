import {
  ChevronRight,
  Clock,
  CreditCard,
  HelpCircle,
  Megaphone,
  MessageCircle,
  Settings,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

type Row = {
  to: string;
  ko: string;
  en: string;
  icon: LucideIcon;
  tint: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-g2">
      <h2 className="type-caption font-semibold text-muted-foreground uppercase px-g1">{title}</h2>
      <div className="rounded-card border border-border bg-card divide-y divide-border shadow-elevate-sm overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function RowLink({ row }: { row: Row }) {
  const { primary } = useLanguage();
  const Icon = row.icon;
  return (
    <Link
      to={row.to}
      className="flex items-center gap-g3 px-g4 py-g3 type-body font-medium hover:bg-secondary/60 transition-colors min-h-12"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-chip border text-foreground ${row.tint}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 truncate">{primary(row.ko, row.en)}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </Link>
  );
}

export default function MyPageScreen() {
  const { primary } = useLanguage();
  const { user, isAnonymous } = useSupabaseAuth();

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
      <div className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g5">
        <div className="rounded-card border border-border bg-card p-g5 shadow-elevate-sm">
          <div className="flex items-center gap-g4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-royal/30 bg-brand-royal/15 text-foreground">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="type-caption text-muted-foreground">{primary("프로필", "Profile")}</p>
              <p className="type-title mt-g1 break-words">
                {isAnonymous
                  ? primary("게스트", "Guest")
                  : (user?.user_metadata?.display_name ?? user?.email ?? primary("게스트", "Guest"))}
              </p>
            </div>
            <Link
              to="/my/profile"
              className="rounded-chip border border-border bg-secondary px-g3 py-g2 type-caption font-semibold text-foreground"
            >
              {primary("편집", "Edit")}
            </Link>
          </div>
        </div>

        <Section title={primary("내 활동", "My activity")}>
          <RowLink
            row={{
              to: "/my/saved",
              ko: "저장한 상점",
              en: "Saved vendors",
              icon: Star,
              tint: "bg-brand-yellow/20 border-brand-yellow/40",
            }}
          />
          <RowLink
            row={{
              to: "/my/history",
              ko: "방문 기록",
              en: "Visit history",
              icon: Clock,
              tint: "bg-brand-royal/15 border-brand-royal/30",
            }}
          />
        </Section>

        <Section title={primary("도움말", "Help")}>
          <RowLink
            row={{
              to: "/announcements",
              ko: "공지사항",
              en: "Announcements",
              icon: Megaphone,
              tint: "bg-brand-aqua/20 border-brand-aqua/40",
            }}
          />
          <RowLink
            row={{
              to: "/my/faq",
              ko: "자주 묻는 질문",
              en: "FAQ",
              icon: HelpCircle,
              tint: "bg-brand-green/20 border-brand-green/40",
            }}
          />
          <RowLink
            row={{
              to: "/my/support",
              ko: "고객 센터",
              en: "Customer center",
              icon: MessageCircle,
              tint: "bg-brand-yellow/20 border-brand-yellow/40",
            }}
          />
        </Section>

        <Section title={primary("결제", "Payment")}>
          <RowLink
            row={{
              to: "/my/payment",
              ko: "결제 수단",
              en: "Payment methods",
              icon: CreditCard,
              tint: "bg-brand-royal/15 border-brand-royal/30",
            }}
          />
        </Section>

        <Section title={primary("기타", "Other")}>
          <RowLink
            row={{
              to: "/my/settings",
              ko: "앱 설정",
              en: "App settings",
              icon: Settings,
              tint: "bg-secondary border-border",
            }}
          />
        </Section>
      </div>
    </div>
  );
}
