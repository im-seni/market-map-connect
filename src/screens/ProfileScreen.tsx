import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "@/components/app/AppButton";
import { StackHeader } from "@/components/app/StackHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/LanguageContext";
import { clearDemoSession, deleteDemoUserByEmail, getDemoSession } from "@/lib/demoAuthStorage";
import { cn } from "@/lib/utils";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const session = getDemoSession();
  const fields =
    session != null
      ? [
          { label: "이름 · Name", value: session.displayName },
          { label: "이메일 · Email", value: session.email },
          { label: "전화번호 · Phone", value: "—" },
        ]
      : [
          { label: "이름 · Name", value: "게스트 · Guest" },
          { label: "이메일 · Email", value: "guest@jemulpogu.market" },
          { label: "전화번호 · Phone", value: "—" },
        ];

  const handleSignOut = () => {
    clearDemoSession();
    navigate("/login");
  };

  const handleConfirmDelete = () => {
    if (!session) return;
    deleteDemoUserByEmail(session.email);
    clearDemoSession();
    setDeleteOpen(false);
    navigate("/");
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <StackHeader title="프로필 · Profile" />
      <div className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g4">
        <div className="rounded-card border border-border bg-card divide-y divide-border shadow-elevate-sm overflow-hidden">
          {fields.map((f) => (
            <div key={f.label} className="px-g4 py-g4">
              <p className="type-caption text-muted-foreground">{f.label}</p>
              <p className="type-body font-medium text-foreground mt-g1">{f.value}</p>
            </div>
          ))}
        </div>
        <AppButton variant="secondary" className="w-full">
          비밀번호 변경 · Change password
        </AppButton>
        <AppButton variant="secondary" className="w-full" onClick={handleSignOut}>
          로그아웃 · Sign out
        </AppButton>
        <AppButton
          variant="tertiary"
          className={cn("w-full", session && "text-destructive")}
          disabled={!session}
          onClick={() => session && setDeleteOpen(true)}
        >
          {primary("계정 삭제 · Delete account", "Delete account")}
        </AppButton>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-[min(100vw-2rem,360px)] gap-g4">
          <DialogHeader>
            <DialogTitle className="type-heading">
              {primary("정말 삭제하시겠습니까?", "Delete your account?")}
            </DialogTitle>
            <DialogDescription className="type-body text-muted-foreground pt-g1">
              {primary(
                "계정 정보가 삭제되며 복구할 수 없어요. 로그아웃 후 초기 화면으로 이동합니다.",
                "Your account data will be removed and cannot be recovered. You will return to the start screen.",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-g2 sm:flex-row sm:justify-end">
            <AppButton variant="secondary" className="w-full sm:w-auto min-h-11" type="button" onClick={() => setDeleteOpen(false)}>
              {primary("취소", "Cancel")}
            </AppButton>
            <button
              type="button"
              className={cn(
                "inline-flex w-full sm:w-auto min-h-11 items-center justify-center rounded-chip px-g5 type-body font-semibold text-white",
                "bg-destructive shadow-elevate-sm hover:brightness-105 transition active:scale-[0.98]",
              )}
              onClick={handleConfirmDelete}
            >
              {primary("삭제", "Delete")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
