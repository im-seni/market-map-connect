import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { FilterChip } from "@/components/app/FilterChip";
import { VendorCard } from "@/components/app/VendorCard";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { CouponCardUi } from "@/components/app/CouponCardUi";
import { sortedAnnouncements } from "@/data/announcements";
import { useCoupons } from "@/contexts/CouponsContext";
import { stores } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { Clock, MapPin, Sparkles } from "lucide-react";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const [q, setQ] = useState("");
  const { coupons } = useCoupons();
  const featuredCoupon = useMemo(
    () => coupons.find((c) => c.state === "active"),
    [coupons],
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return stores;
    const s = q.toLowerCase();
    return stores.filter(
      (x) =>
        x.name.toLowerCase().includes(s) ||
        x.nameEn.toLowerCase().includes(s) ||
        x.category.toLowerCase().includes(s)
    );
  }, [q]);

  const popular = [...filtered].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const shortWait = [...filtered].sort((a, b) => a.waitTime - b.waitTime).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar
        showSearchSlot
        searchSlot={
          <label className="block">
            <span className="sr-only">Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={primary("음식이나 가게 검색", "Search vendors or food")}
              className="w-full h-11 rounded-chip border border-border bg-secondary px-g4 type-body outline-none focus:ring-2 focus:ring-brand-royal/30"
            />
          </label>
        }
      />
      <div className="flex-1 overflow-y-auto px-g4 pt-g5 pb-g8 space-y-g8">
        <section className="rounded-card border border-border bg-gradient-to-br from-brand-royal/10 to-brand-aqua/10 p-g5 shadow-elevate-sm">
          <div className="flex items-start gap-g3">
            <Sparkles className="h-6 w-6 text-brand-royal shrink-0 mt-g1" />
            <div className="space-y-g2">
              <h2 className="type-title text-foreground text-balance">
                {primary("오늘 밤의 하이라이트", "Tonight's highlights")}
              </h2>
              <p className="type-body text-muted-foreground text-pretty">
                {primary(
                  "짧은 대기 시간, 버스킹 공연, 시원한 한강 바람",
                  "Short waits, busking shows, cool river breeze",
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-g3">
          <div className="flex items-center justify-between">
            <h3 className="type-heading text-foreground">{primary("행사 안내", "Events")}</h3>
            <Link to="/announcements" className="type-caption font-semibold text-brand-royal">
              {primary("전체 보기", "View all")}
            </Link>
          </div>
          <AnnouncementBanner item={sortedAnnouncements()[0]} onClick={() => navigate("/announcements")} />
        </section>

        <section className="space-y-g3">
          <h3 className="type-heading">{primary("빠른 이동", "Quick links")}</h3>
          <div className="flex flex-wrap gap-g2">
            <FilterChip active onClick={() => navigate("/map")}>
              {primary("지도 보기", "View map")}
            </FilterChip>
            <FilterChip onClick={() => navigate("/map?view=list")}>
              {primary("전체 상점", "All vendors")}
            </FilterChip>
            <FilterChip onClick={() => navigate("/announcements")}>
              {primary("행사", "Events")}
            </FilterChip>
            <FilterChip onClick={() => navigate("/my/saved")}>
              {primary("저장한 상점", "Saved")}
            </FilterChip>
            <FilterChip onClick={() => navigate("/coupons")}>
              {primary("쿠폰", "Coupons")}
            </FilterChip>
          </div>
        </section>

        {featuredCoupon && (
          <section className="space-y-g3">
            <div className="flex items-center justify-between">
              <h3 className="type-heading">{primary("추천 쿠폰", "Featured coupon")}</h3>
              <Link to="/coupons" className="type-caption font-semibold text-brand-royal">
                {primary("더 보기", "See more")}
              </Link>
            </div>
            <CouponCardUi coupon={featuredCoupon} />
          </section>
        )}

        <section className="space-y-g3">
          <div className="flex items-center gap-g2">
            <MapPin className="h-5 w-5 text-brand-royal" />
            <h3 className="type-heading">{primary("지금 인기", "Popular now")}</h3>
          </div>
          <div className="space-y-g3">
            {popular.map((s) => (
              <VendorCard key={s.id} store={s} onClick={() => navigate(`/vendor/${s.id}`)} />
            ))}
          </div>
        </section>

        <section className="space-y-g3">
          <div className="flex items-center gap-g2">
            <Clock className="h-5 w-5 text-brand-royal" />
            <h3 className="type-heading">{primary("대기 시간 짧은 곳", "Short wait time")}</h3>
          </div>
          <div className="space-y-g3">
            {shortWait.map((s) => (
              <VendorCard key={s.id} store={s} onClick={() => navigate(`/vendor/${s.id}`)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
