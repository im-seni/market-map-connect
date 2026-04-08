import { ScanLine } from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { AppButton } from "@/components/app/AppButton";
import { RewardStampRing, MilestoneCard } from "@/components/app/RewardStampRing";

export default function RewardsScreen() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
        <div>
          <h2 className="type-title text-foreground">리워드 · Rewards</h2>
          <p className="type-body text-muted-foreground mt-g2">
            방문 스탬프를 모아 혜택을 잠금 해제하세요 · Collect stamps to unlock perks
          </p>
        </div>
        <RewardStampRing current={3} total={8} />
        <div className="space-y-g3">
          <MilestoneCard titleKo="첫 방문 음료" titleEn="First visit drink" unlocked />
          <MilestoneCard titleKo="5스탬프 할인" titleEn="5-stamp discount" unlocked />
          <MilestoneCard titleKo="8스탬프 굿즈" titleEn="8-stamp merch" unlocked={false} />
        </div>
        <AppButton variant="primary" className="w-full">
          <ScanLine className="h-5 w-5" />
          현장 스캔 · Scan at booth
        </AppButton>
      </div>
    </div>
  );
}
