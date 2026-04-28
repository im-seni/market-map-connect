import { Link } from "react-router-dom";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { AppButton } from "@/components/app/AppButton";
import { FilterChip } from "@/components/app/FilterChip";
import { CrowdChip, VendorStatusChip } from "@/components/app/StatusChip";
import { CouponCardUi } from "@/components/app/CouponCardUi";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { RewardStampRing } from "@/components/app/RewardStampRing";
import { VendorCard } from "@/components/app/VendorCard";
import { coupons } from "@/data/coupons";
import { announcements } from "@/data/announcements";
import { stores } from "@/data/stores";

export default function ComponentsPage() {
  const sample = stores[0];
  const coupon = coupons[0];

  return (
    <PhoneFrame className="min-h-dvh bg-background">
      <header className="border-b border-border px-g4 py-g4 flex items-center justify-between">
        <h1 className="type-title">01_Components</h1>
        <Link to="/ds/02-screens" className="type-caption text-brand-royal font-semibold">
          Screens →
        </Link>
      </header>
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g8">
        <section className="space-y-g3">
          <h2 className="type-heading">CTA buttons</h2>
          <AppButton variant="primary" className="w-full">
            Primary coral
          </AppButton>
          <AppButton variant="secondary" className="w-full">
            Secondary navy outline
          </AppButton>
          <AppButton variant="tertiary" className="w-full">
            Tertiary text
          </AppButton>
        </section>
        <section className="space-y-g3">
          <h2 className="type-heading">Status chips</h2>
          <div className="flex flex-wrap gap-g2">
            <CrowdChip kind="low" labelKo="여유" labelEn="Low" />
            <CrowdChip kind="moderate" labelKo="보통" labelEn="Moderate" />
            <CrowdChip kind="busy" labelKo="혼잡" labelEn="Busy" />
            <VendorStatusChip kind="open" labelKo="영업 중" labelEn="Open" />
            <VendorStatusChip kind="pre_open" labelKo="영업 전" labelEn="Before opening" />
            <VendorStatusChip kind="closed" labelKo="영업 마감" labelEn="Closed" />
          </div>
        </section>
        <section className="space-y-g3">
          <h2 className="type-heading">Filter chips</h2>
          <div className="flex flex-wrap gap-g2">
            <FilterChip active>전체 · All</FilterChip>
            <FilterChip>꼬치 · Skewer</FilterChip>
            <FilterChip>음료 · Drinks</FilterChip>
          </div>
        </section>
        <section className="space-y-g3">
          <h2 className="type-heading">Vendor card</h2>
          <VendorCard store={sample} />
        </section>
        <section className="space-y-g3">
          <h2 className="type-heading">Reward ring</h2>
          <RewardStampRing current={3} total={10} />
        </section>
        <section className="space-y-g3">
          <h2 className="type-heading">Coupon card</h2>
          <CouponCardUi coupon={coupon} linkToDetail={false} />
        </section>
        <section className="space-y-g3">
          <h2 className="type-heading">Announcement banner</h2>
          <AnnouncementBanner item={announcements[0]} />
        </section>
        <p className="type-caption text-muted-foreground pb-g8">
          Top utility bar · Bottom nav · Bottom sheet는 화면(02)·프로토타입(03)에서 확인
        </p>
      </div>
    </PhoneFrame>
  );
}
