import { StackHeader } from "@/components/app/StackHeader";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

export default function AppSettingsScreen() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <StackHeader title="앱 설정 · App settings" />
      <div className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g3">
        <div className="flex items-center justify-between rounded-card border border-border bg-card p-g4 shadow-elevate-sm">
          <div>
            <p className="type-body font-semibold">다크 모드 · Dark mode</p>
            <p className="type-caption text-muted-foreground mt-g1">
              {theme === "dark" ? "켜짐 · On" : "꺼짐 · Off"}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="rounded-card border border-border bg-card p-g4 shadow-elevate-sm">
          <p className="type-body font-semibold">알림 · Notifications</p>
          <p className="type-caption text-muted-foreground mt-g1">준비 중 · Coming soon</p>
        </div>
        <div className="rounded-card border border-border bg-card p-g4 shadow-elevate-sm">
          <p className="type-body font-semibold">개인정보 처리방침 · Privacy</p>
          <p className="type-caption text-muted-foreground mt-g1">준비 중 · Coming soon</p>
        </div>
      </div>
    </div>
  );
}
