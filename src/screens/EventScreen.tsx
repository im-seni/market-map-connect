import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Clock, Info, Map as MapIcon, PlayCircle, Ship, Ticket, Users } from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { AppButton } from "@/components/app/AppButton";
import { useLanguage } from "@/i18n/LanguageContext";
import { getNowInKst } from "@/lib/timeKst";
import { cn } from "@/lib/utils";
import logoCharacter from "@/assets/logo/character.png";

// Eagerly load any poster images dropped into src/assets/posters/
const _posterModules = import.meta.glob("/src/assets/posters/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;
function getPoster(filename: string): string | undefined {
  return _posterModules[`/src/assets/posters/${filename}`];
}

type EventTab = "outdoor" | "yacht";

const OUTDOOR_VENUE_KO = "상트페테르부르크 광장";
const OUTDOOR_VENUE_EN = "St. Petersburg Square";
const SCREEN_KO = "야외 스크린";
const SCREEN_EN = "Outdoor screen";
const STAGE_KO = "메인 스테이지";
const STAGE_EN = "Main stage";

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDayBadge(d: Date, ko: boolean) {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const wdKo = ["일", "월", "화", "수", "목", "금", "토"];
  const wdEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return ko
    ? `${m}/${day} (${wdKo[d.getDay()]})`
    : `${m}/${day} (${wdEn[d.getDay()]})`;
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function nextFriSatDates(n: number) {
  const r: Date[] = [];
  const t = getNowInKst();
  t.setHours(12, 0, 0, 0);
  for (let i = 0; i < 100 && r.length < n; i++) {
    const d = addDays(t, i);
    const w = d.getDay();
    if (w === 5 || w === 6) r.push(d);
  }
  return r;
}

type CinemaItem = {
  kind: "cinema";
  startKey: string;
  timeRangeKo: string;
  timeRangeEn: string;
  titleKo: string;
  titleEn: string;
  poster?: string;
};

type LiveItem = {
  kind: "live";
  startKey: string;
  timeRangeKo: string;
  timeRangeEn: string;
  actKo: string;
  actEn: string;
  setlistKo: string[];
  setlistEn: string[];
};

type OutdoorItem = CinemaItem | LiveItem;

function useOutdoorByDay() {
  return useMemo(() => {
    const dates = nextFriSatDates(4);

    const cinemaByIdx: Omit<CinemaItem, "kind">[][] = [
      [
        {
          startKey: "20:30",
          timeRangeKo: "20:30~22:40",
          timeRangeEn: "8:30–10:40 PM",
          titleKo: "범죄도시 4",
          titleEn: "Crime City 4",
          poster: "crime-city-4.jpg",
        },
      ],
      [
        {
          startKey: "20:45",
          timeRangeKo: "20:45~22:45",
          timeRangeEn: "8:45–10:45 PM",
          titleKo: "듄: 파트 2",
          titleEn: "Dune: Part Two",
          poster: "dune-part-2.jpg",
        },
      ],
      [
        {
          startKey: "20:15",
          timeRangeKo: "20:15~22:45",
          timeRangeEn: "8:15–10:45 PM",
          titleKo: "인터스텔라",
          titleEn: "Interstellar",
          poster: "interstellar.jpg",
        },
      ],
      [
        {
          startKey: "20:15",
          timeRangeKo: "20:15~22:05",
          timeRangeEn: "8:15–10:05 PM",
          titleKo: "비긴어게인",
          titleEn: "Begin Again",
          poster: "begin-again.jpg",
        },
      ],
    ];

    const liveByIdx: Omit<LiveItem, "kind">[][] = [
      [
        {
          startKey: "18:00",
          timeRangeKo: "18:00~18:50",
          timeRangeEn: "6:00–6:50 PM",
          actKo: "밴드 파란노을",
          actEn: "Band Blue Dusk",
          setlistKo: ["벚꽃 엔딩", "한 페이지가 될 수 있게", "좋은 밤 좋은 꿈"],
          setlistEn: ["Cherry Blossom Ending", "Time of Our Life", "Good Night Good Dream"],
        },
      ],
      [
        {
          startKey: "18:30",
          timeRangeKo: "18:30~19:20",
          timeRangeEn: "6:30–7:20 PM",
          actKo: "스트리트 재즈 트리오",
          actEn: "Street jazz trio",
          setlistKo: ["Autumn Leaves", "Fly Me to the Moon", "Take Five"],
          setlistEn: ["Autumn Leaves", "Fly Me to the Moon", "Take Five"],
        },
        {
          startKey: "19:30",
          timeRangeKo: "19:30~20:20",
          timeRangeEn: "7:30–8:20 PM",
          actKo: "어쿠스틱 듀오 ‘달빛’",
          actEn: "Acoustic duo “Moonlight”",
          setlistKo: ["밤편지", "주저하는 연인들을 위해", "너의 의미"],
          setlistEn: ["Through the Night", "For Lovers Who Hesitate", "Meaning of You"],
        },
      ],
      [
        {
          startKey: "17:30",
          timeRangeKo: "17:30~18:20",
          timeRangeEn: "5:30–6:20 PM",
          actKo: "인디 밴드 ‘북두’",
          actEn: "Indie band “Bukdu”",
          setlistKo: ["파도 위로", "노을 신호", "도시의 밤"],
          setlistEn: ["Over the Wave", "Sunset Signal", "City at Night"],
        },
        {
          startKey: "18:35",
          timeRangeKo: "18:35~19:25",
          timeRangeEn: "6:35–7:25 PM",
          actKo: "플레이리스트 DJ 세트",
          actEn: "Playlist DJ set",
          setlistKo: ["Warmup House Mix", "Midnight Pop Edit", "Pier Closing Track"],
          setlistEn: ["Warmup House Mix", "Midnight Pop Edit", "Pier Closing Track"],
        },
      ],
      [
        {
          startKey: "18:00",
          timeRangeKo: "18:00~18:50",
          timeRangeEn: "6:00–6:50 PM",
          actKo: "라이브 밴드 ‘해변’",
          actEn: "Live band “Beach”",
          setlistKo: ["나는 나비", "여행", "한강에서"],
          setlistEn: ["I Am a Butterfly", "Trip", "At the Han River"],
        },
        {
          startKey: "19:00",
          timeRangeKo: "19:00~19:50",
          timeRangeEn: "7:00–7:50 PM",
          actKo: "DJ Sola",
          actEn: "DJ Sola",
          setlistKo: ["Ocean Pulse", "Neon Pier", "Last Ferry Home"],
          setlistEn: ["Ocean Pulse", "Neon Pier", "Last Ferry Home"],
        },
      ],
    ];

    return dates.map((date, idx) => {
      const movies: OutdoorItem[] = (cinemaByIdx[idx] ?? []).map((c) => ({ kind: "cinema" as const, ...c }));
      const lives: OutdoorItem[] = (liveByIdx[idx] ?? []).map((c) => ({ kind: "live" as const, ...c }));
      const items = [...movies, ...lives].sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "cinema" ? -1 : 1;
        return timeToMin(a.startKey) - timeToMin(b.startKey);
      });
      return { date, labelKo: formatDayBadge(date, true), labelEn: formatDayBadge(date, false), items };
    });
  }, []);
}

export default function EventScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const [tab, setTab] = useState<EventTab>("outdoor");
  const [expandedBuskingKeys, setExpandedBuskingKeys] = useState<Record<string, boolean>>({});
  const outdoorByDay = useOutdoorByDay();

  const openYoutubeSearch = (song: string, act: string) => {
    const q = encodeURIComponent(`${song} ${act}`);
    window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const st = location.state as { eventTab?: string } | undefined;
    if (st?.eventTab === "yacht") setTab("yacht");
    else if (st?.eventTab === "outdoor") setTab("outdoor");
  }, [location.state]);

  const yachtToday = useMemo(() => {
    const d = getNowInKst();
    const seed = d.getDate() + d.getMonth() * 3;
    const slots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map(
      (time, i) => {
        const cap = 24;
        const remaining = Math.max(0, (seed * 7 + i * 3) % (cap + 4) - 1);
        return { time, remaining, capacity: cap };
      },
    );
    return { labelKo: formatDayBadge(d, true), labelEn: formatDayBadge(d, false), slots };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <TopUtilityBar />
      <div className="min-h-0 flex-1 overflow-y-auto px-g4 pt-0 pb-g4">
        {/* Hero banner — tab-specific */}
        {tab === "outdoor" ? (
          <div className="-mx-g4 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 px-g4 pt-g4 pb-g5">
            <span aria-hidden className="pointer-events-none absolute left-5 top-2 text-base text-white/25 select-none">✦</span>
            <span aria-hidden className="pointer-events-none absolute right-28 top-4 text-sm text-white/20 select-none">★</span>
            <span aria-hidden className="pointer-events-none absolute bottom-3 left-14 text-xs text-white/15 select-none">✦</span>
            <div className="flex items-center justify-between gap-g3">
              <div className="min-w-0">
                <p className="type-caption font-semibold tracking-wide text-indigo-300">Moonlight Port Night Market 🌙</p>
                <h1 className="type-title font-bold text-white mt-g1">
                  {primary("오늘의 이벤트", "Tonight's Events")}
                </h1>
              </div>
              <img src={logoCharacter} alt="" aria-hidden className="h-20 w-20 shrink-0 object-contain drop-shadow-lg" />
            </div>
          </div>
        ) : (
          <div className="-mx-g4 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900 px-g4 pt-g4 pb-g5">
            <span aria-hidden className="pointer-events-none absolute left-4 top-3 text-lg text-white/20 select-none">🌊</span>
            <span aria-hidden className="pointer-events-none absolute right-8 bottom-3 text-base text-white/20 select-none">🌊</span>
            <span aria-hidden className="pointer-events-none absolute right-24 top-2 text-xs text-white/15 select-none">⚓</span>
            <div className="flex items-center justify-between gap-g3">
              <div className="min-w-0">
                <p className="type-caption font-semibold tracking-wide text-cyan-300">Moonlight Port Night Market ⛵</p>
                <h1 className="type-title font-bold text-white mt-g1">
                  {primary("미니 요트 크루즈", "Mini Yacht Cruise")}
                </h1>
              </div>
              <div aria-hidden className="flex h-20 w-20 shrink-0 items-center justify-center text-5xl drop-shadow-lg select-none">⛵</div>
            </div>
          </div>
        )}
        {/* Tab bar */}
        <div className="sticky top-0 z-10 -mx-g4 border-b border-border bg-background">
          <div className="flex px-g4">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "outdoor"}
              className={cn(
                "flex-1 py-g3 type-body text-center transition-colors",
                tab === "outdoor"
                  ? "font-bold text-brand-royal border-b-[3px] border-brand-royal -mb-px"
                  : "font-medium text-muted-foreground border-b-[3px] border-transparent -mb-px",
              )}
              onClick={() => setTab("outdoor")}
            >
              {primary("야외 이벤트", "Outdoor")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "yacht"}
              className={cn(
                "flex-1 py-g3 type-body text-center transition-colors",
                tab === "yacht"
                  ? "font-bold text-brand-royal border-b-[3px] border-brand-royal -mb-px"
                  : "font-medium text-muted-foreground border-b-[3px] border-transparent -mb-px",
              )}
              onClick={() => setTab("yacht")}
            >
              {primary("미니 요트", "Mini yacht")}
            </button>
          </div>
        </div>
        {tab === "outdoor" ? (
          <div className="mt-g5 space-y-g5">
            <div className="rounded-2xl border border-brand-royal/30 bg-brand-royal/[0.06] px-g4 py-g3">
              <p className="type-caption font-semibold text-brand-royal">{primary("장소", "Venue")}</p>
              <p className="type-body font-bold text-foreground mt-g1">
                {primary(OUTDOOR_VENUE_KO, OUTDOOR_VENUE_EN)}
              </p>
              <AppButton
                variant="secondary"
                className="w-full mt-g3"
                type="button"
                onClick={() => navigate("/map", { state: { mapFocusPin: "eventPlaza" } })}
              >
                <MapIcon className="mr-g2 h-4 w-4" />
                {primary("지도에서 보기", "View on map")}
              </AppButton>
            </div>
            <div className="space-y-g4">
              {outdoorByDay.map((day) => (
                <div key={day.labelKo}>
                  <p className="type-body font-bold text-foreground mb-g2">
                    {primary(day.labelKo, day.labelEn)}
                  </p>
                  <div className="space-y-g2">
                    {day.items.map((item) => {
                      if (item.kind === "cinema") {
                        const posterUrl = item.poster ? getPoster(item.poster) : undefined;
                        return (
                          <div
                            key={`${day.labelKo}-c-${item.startKey}-${item.titleKo}`}
                            className="rounded-xl border border-border border-l-4 border-l-purple-400 bg-card p-g3 shadow-elevate-sm"
                          >
                            <div className="mb-g2">
                              <span className="inline-flex items-center rounded-full bg-purple-400/15 px-2.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-300">
                                {primary("야외영화", "Outdoor film")}
                              </span>
                            </div>
                            <div className="flex gap-g3">
                              {posterUrl && (
                                <img
                                  src={posterUrl}
                                  alt=""
                                  aria-hidden
                                  className="w-[4.5rem] h-[6.5rem] rounded-md object-cover shrink-0 shadow-sm"
                                />
                              )}
                              <dl className="flex-1 min-w-0 flex flex-col">
                                <div className="space-y-g2">
                                  <div className="flex items-start justify-between gap-g2">
                                    <dt className="type-caption text-muted-foreground shrink-0">{primary("상영작", "Film")}</dt>
                                    <dd className="type-caption font-semibold text-foreground text-right min-w-0">
                                      {primary(item.titleKo, item.titleEn)}
                                    </dd>
                                  </div>
                                  <div className="flex items-baseline justify-between gap-g2">
                                    <dt className="type-caption text-muted-foreground shrink-0">{primary("시간", "Time")}</dt>
                                    <dd className="type-caption font-bold tabular-nums text-foreground text-right">
                                      {primary(item.timeRangeKo, item.timeRangeEn)}
                                    </dd>
                                  </div>
                                </div>
                                <div className="mt-g3 flex items-start justify-between gap-g2 pt-g1 border-t border-border/80">
                                  <dt className="type-caption text-muted-foreground shrink-0">{primary("위치", "Location")}</dt>
                                  <dd className="type-caption text-foreground text-right">
                                    {primary(`${SCREEN_KO} · ${OUTDOOR_VENUE_KO}`, `${SCREEN_EN} · ${OUTDOOR_VENUE_EN}`)}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        );
                      }
                      const liveKey = `${day.labelKo}-l-${item.startKey}-${item.actKo}`;
                      const expanded = !!expandedBuskingKeys[liveKey];
                      return (
                        <div
                          key={liveKey}
                          className="rounded-xl border border-border border-l-4 border-l-amber-400 bg-card p-g3 shadow-elevate-sm"
                        >
                          <div className="mb-g2">
                            <span className="inline-flex items-center rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                              {primary("버스킹", "Busking")}
                            </span>
                          </div>
                          <dl className="space-y-g2">
                            <div className="flex items-baseline justify-between gap-g3">
                              <dt className="type-caption text-muted-foreground shrink-0">{primary("시간", "Time")}</dt>
                              <dd className="type-caption font-bold tabular-nums text-foreground text-right">
                                {primary(item.timeRangeKo, item.timeRangeEn)}
                              </dd>
                            </div>
                            <div className="flex items-start justify-between gap-g3">
                              <dt className="type-caption text-muted-foreground shrink-0">{primary("출연", "Act")}</dt>
                              <dd className="type-caption font-semibold text-foreground text-right min-w-0">
                                {primary(item.actKo, item.actEn)}
                              </dd>
                            </div>
                            <div className="flex items-start justify-between gap-g3 pt-g1 border-t border-border/80">
                              <dt className="type-caption text-muted-foreground shrink-0">{primary("위치", "Location")}</dt>
                              <dd className="type-caption text-foreground text-right">
                                {primary(
                                  `${STAGE_KO} · ${OUTDOOR_VENUE_KO}`,
                                  `${STAGE_EN} · ${OUTDOOR_VENUE_EN}`,
                                )}
                              </dd>
                            </div>
                            <div className="pt-g1 border-t border-border/80">
                              <button
                                type="button"
                                className="w-full inline-flex items-center justify-between gap-g2 rounded-lg border border-brand-royal/25 bg-brand-royal/[0.05] px-g3 py-g2 type-caption font-semibold text-brand-royal"
                                onClick={() =>
                                  setExpandedBuskingKeys((prev) => ({
                                    ...prev,
                                    [liveKey]: !prev[liveKey],
                                  }))
                                }
                                aria-expanded={expanded}
                              >
                                <span>{primary("🎵 Setlist", "🎵 Setlist")}</span>
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    expanded && "rotate-180",
                                  )}
                                />
                              </button>
                              {expanded && (
                                <ul className="mt-g2 space-y-1 rounded-lg border border-border bg-secondary/30 px-g3 py-g2">
                                  {item.setlistKo.map((song, idx) => (
                                    <li key={`${liveKey}-${song}`}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openYoutubeSearch(
                                            primary(song, item.setlistEn[idx] ?? song),
                                            primary(item.actKo, item.actEn),
                                          )
                                        }
                                        className="w-full rounded-md px-g2 py-1.5 transition hover:bg-brand-royal/10"
                                      >
                                        <span className="flex items-center justify-between gap-g2">
                                          <span className="type-caption text-foreground">
                                            {idx + 1}. {primary(song, item.setlistEn[idx] ?? song)}
                                          </span>
                                          <PlayCircle className="h-4 w-4 shrink-0 text-brand-royal" />
                                        </span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </dl>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-g5 space-y-g4">
            <div className="rounded-2xl border border-border bg-card p-g4 shadow-elevate-sm">
              <div className="flex items-start gap-g3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-royal/10">
                  <Ship className="h-5 w-5 text-brand-royal" />
                </div>
                <div>
                  <h2 className="type-body font-bold text-foreground sm:text-lg">
                    {primary("팔미도 미니 요트 크루즈", "Palmido mini yacht cruise")}
                  </h2>
                  <p className="type-caption text-muted-foreground mt-0.5">
                    {primary("인천 앞바다 30분 라운딩 · 최소출발인원 4인", "30 min harbor loop · min. 4 to depart")}
                  </p>
                </div>
              </div>
              <div className="mt-g3 flex flex-wrap gap-g3">
                <div className="rounded-xl border border-border bg-secondary/50 px-g3 py-2.5 min-w-[7.5rem]">
                  <p className="type-caption text-muted-foreground">{primary("1인 요금", "Per person")}</p>
                  <p className="type-body font-semibold tabular-nums text-foreground mt-0.5">₩25,000</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/50 px-g3 py-2.5 flex-1 min-w-[10rem]">
                  <p className="type-caption text-muted-foreground">{primary("승선", "Boarding")}</p>
                  <p className="type-body font-semibold text-foreground mt-0.5">
                    {primary("인천항 여객 터미널", "Incheon ferry passenger terminal")}
                  </p>
                </div>
              </div>
              <AppButton
                variant="secondary"
                className="w-full mt-g3"
                type="button"
                onClick={() => navigate("/map", { state: { mapFocusPin: "ferryTerminal" } })}
              >
                <Users className="mr-g2 h-4 w-4" />
                {primary("승선 위치 지도에서 보기", "Boarding location on map")}
              </AppButton>
            </div>
            <div className="rounded-card border border-border bg-card p-g4 space-y-g3">
              <div className="flex items-center gap-g2">
                <Ticket className="h-5 w-5 text-brand-royal shrink-0" />
                <h3 className="type-body font-bold text-foreground">{primary("예약 방법", "How to reserve")}</h3>
              </div>
              <ol className="space-y-g3 list-decimal pl-g5 type-caption text-foreground leading-relaxed">
                <li>
                  {primary(
                    "아래 출발 시간·잔여 좌석을 확인한 뒤 여객 터미널에 방문해 주세요.",
                    "Check departures and seats below, then visit the passenger terminal.",
                  )}
                </li>
                <li>
                  {primary(
                    "결제 및 예약은 현장에서 카드·현금으로 진행됩니다.",
                    "Payment and booking are on-site by card or cash.",
                  )}
                </li>
                <li>
                  {primary(
                    "천후에 따라 출항이 조정될 수 있으며, 마감 시간대는 현장 안내를 따릅니다.",
                    "Departures may change with weather; last sailings follow on-site announcements.",
                  )}
                </li>
              </ol>
              <div className="flex items-start gap-g2 rounded-lg bg-secondary/60 px-g3 py-g2">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="type-caption text-muted-foreground">
                  {primary(
                    "단체·워크샵 예약은 행사 운영 사무실로 문의해 주세요.",
                    "For groups or workshops, contact the night market events office.",
                  )}
                </p>
              </div>
            </div>
            <div className="rounded-card border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-secondary/30 px-g4 py-g3">
                <p className="type-body font-bold text-foreground">
                  {primary(yachtToday.labelKo, yachtToday.labelEn)}
                </p>
                <p className="type-caption text-muted-foreground mt-g1">
                  {primary("출발 시간 · 잔여 좌석", "Departures · seats left")}
                </p>
              </div>
              <ul className="divide-y divide-border">
                {yachtToday.slots.map(({ time, remaining, capacity }) => {
                  const full = remaining === 0;
                  return (
                    <li key={time} className="flex items-center justify-between gap-g3 px-g4 py-g3">
                      <div className="flex items-center gap-g2 min-w-0">
                        <Clock className="h-4 w-4 text-brand-royal shrink-0" />
                        <span className="type-body font-bold tabular-nums text-foreground">{time}</span>
                      </div>
                      <p
                        className={cn(
                          "type-caption font-semibold tabular-nums text-right",
                          full ? "text-destructive" : "text-emerald-600",
                        )}
                      >
                        {full
                          ? primary("마감", "Full")
                          : primary(`잔여 ${remaining}석 / ${capacity}석`, `${remaining} / ${capacity} left`)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
