import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StackHeader } from "@/components/app/StackHeader";
import { AppButton } from "@/components/app/AppButton";

const fields: { label: string; value: string }[] = [
  { label: "이름 · Name", value: "게스트 · Guest" },
  { label: "이메일 · Email", value: "guest@jemulpogu.market" },
  { label: "전화번호 · Phone", value: "—" },
];

export default function ProfileScreen() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    toast("로그아웃되었습니다 · Signed out");
    navigate("/login");
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
        <AppButton variant="tertiary" className="w-full">
          계정 삭제 · Delete account
        </AppButton>
      </div>
    </div>
  );
}
