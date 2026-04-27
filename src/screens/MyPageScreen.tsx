import { ChevronRight, Clock, CreditCard, Gift, HelpCircle, type LucideIcon, Megaphone, MessageCircle, Newspaper, PartyPopper, Settings, Star, User } from "lucide-react";
import { Link } from "react-router-dom";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { ActivityCard, getActivityState } from "@/components/app/ActivityCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQueue } from "@/contexts/QueueContext";
import { storeById } from "@/data/stores";

type Row = {
  to: string;
  ko: string;
  en: string;
  icon: LucideIcon;
  /* Background tint only — text color is always foreground for visual consistency. */
  tint: string;
};

type Group = { titleKo: string; titleEn: string; rows: Row[] };

const groups: Group[] = [
  {
    titleKo: "내 활동",
    titleEn: "My activity",
    rows: [
      { to: "/my/saved", ko: "저장한 상점", en: "Saved vendors", icon: Star, tint: "bg-brand-yellow/20 border-brand-yellow/40" },
      { to: "/my/history", ko: "방문 기록", en: "Visit history", icon: Clock, tint: "bg-brand-royal/15 border-brand-royal/30" },
    ],
  },
  {
    titleKo: "새소식",
    titleEn: "Updates",
    rows: [
      { to: "/announcements", ko: "행사", en: "Events", icon: PartyPopper, tint: "bg-brand-coral/15 border-brand-coral/35" },
      { to: "/announcements", ko: "공지사항", en: "Announcements", icon: Megaphone, tint: "bg-brand-aqua/20 border-brand-aqua/40" },
      { to: "/announcements", ko: "소식", en: "News", icon: Newspaper, tint: "bg-brand-pink-soft/35 border-brand-pink-soft/55" },
    ],
  },
  {
    titleKo: "결제",
    titleEn: "Payments",
    rows: [
      { to: "/my/payment", ko: "결제 수단", en: "Payment methods", icon: CreditCard, tint: "bg-brand-royal/15 border-brand-royal/30" },
      { to: "/coupons", ko: "혜택", en: "Rewards", icon: Gift, tint: "bg-brand-coral/15 border-brand-coral/35" },
    ],
  },
  {
    titleKo: "도움말",
    titleEn: "Help",
    rows: [
      { to: "/my/faq", ko: "자주 묻는 질문", en: "FAQ", icon: HelpCircle, tint: "bg-brand-green/20 border-brand-green/40" },
      { to: "/my/support", ko: "고객센터", en: "Customer service", icon: MessageCircle, tint: "bg-brand-yellow/20 border-brand-yellow/40" },
    ],
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-g2">
      <h2 className="type-caption font-semibold text-muted-foreground uppercase px-g1">
        {title}
      </h2>
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
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-chip border text-foreground ${row.tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 truncate">{primary(row.ko, row.en)}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </Link>
  );
}

// Sort tickets by urgency: almost_up → up_next → in_line.
const stateOrder: Record<ReturnType<typeof getActivityState>, number> = {
  almost_up: 0,
  up_next: 1,
  in_line: 2,
};

export default function MyPageScreen() {
  const { primary } = useLanguage();
  const { tickets } = useQueue();

  const activeQueues = tickets
    .map((t) => ({ ticket: t, store: storeById(t.vendorId) }))
    .filter((x): x is { ticket: typeof tickets[number]; store: NonNullable<ReturnType<typeof storeById>> } => !!x.store)
    .sort(
      (a, b) =>
        stateOrder[getActivityState(a.ticket)] - stateOrder[getActivityState(b.ticket)] ||
        a.ticket.peopleAhead - b.ticket.peopleAhead,
    );

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
      <div className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g5">
        {/* Profile */}
        <div className="rounded-card border border-border bg-card p-g5 shadow-elevate-sm">
          <div className="flex items-center gap-g4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-royal/30 bg-brand-royal/15 text-foreground">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="type-caption text-muted-foreground">{primary("프로필", "Profile")}</p>
              <p className="type-title mt-g1">{primary("게스트", "Guest")}</p>
            </div>
            <Link
              to="/my/profile"
              className="rounded-chip border border-border bg-secondary px-g3 py-g2 type-caption font-semibold text-foreground"
            >
              {primary("편집", "Edit")}
            </Link>
          </div>
        </div>

        {/* Activity — only renders when the user has active queue tickets */}
        {activeQueues.length > 0 && (
          <section className="space-y-g2">
            <h2 className="type-caption font-semibold text-muted-foreground uppercase px-g1 flex items-center justify-between">
              <span>
                {primary("내 활동", "Activity")} · {activeQueues.length}{" "}
                {primary("대기", activeQueues.length === 1 ? "queue" : "queues")}
              </span>
            </h2>
            <div className="space-y-g3">
              {activeQueues.map(({ ticket, store }) => (
                <ActivityCard key={ticket.vendorId} ticket={ticket} store={store} />
              ))}
            </div>
          </section>
        )}

        {groups.map((g) => (
          <Section key={g.titleEn} title={primary(g.titleKo, g.titleEn)}>
            {g.rows.map((r) => (
              <RowLink key={`${g.titleEn}-${r.ko}`} row={r} />
            ))}
          </Section>
        ))}

        {/* Other */}
        <Section title={primary("기타", "Other")}>
          <Link
            to="/my/settings"
            className="flex items-center gap-g3 px-g4 py-g3 type-body font-medium hover:bg-secondary/60 transition-colors min-h-12"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip border border-border bg-secondary text-foreground">
              <Settings className="h-5 w-5" />
            </span>
            <span className="flex-1 truncate">{primary("앱 설정", "App settings")}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </Link>
        </Section>
      </div>
    </div>
  );
}
