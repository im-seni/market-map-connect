import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Store, waitTimeColorClass } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

// Map wait-time color class → companion border / bg / halo classes.
// Keeps colors centralized to the same green/yellow/red scale used elsewhere.
const waitClassMap: Record<string, { border: string; bg: string; halo: string; dot: string }> = {
  "text-brand-green": {
    border: "border-brand-green",
    bg: "bg-brand-green",
    halo: "bg-brand-green/25",
    dot: "bg-brand-green",
  },
  "text-brand-yellow": {
    border: "border-brand-yellow",
    bg: "bg-brand-yellow",
    halo: "bg-brand-yellow/25",
    dot: "bg-brand-yellow",
  },
  "text-brand-coral": {
    border: "border-brand-coral",
    bg: "bg-brand-coral",
    halo: "bg-brand-coral/25",
    dot: "bg-brand-coral",
  },
};

interface NightMarketMapProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 1.5; // multiplier for +/- and double-tap

const NightMarketMap = ({ stores, onStoreClick }: NightMarketMapProps) => {
  const { primary } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Pointer state for pan + pinch
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinchStartRef = useRef<{ dist: number; scale: number; cx: number; cy: number; ox: number; oy: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const movedRef = useRef(false);

  // Clamp the offset so the image stays within the viewport bounds
  const clampOffset = useCallback((x: number, y: number, s: number) => {
    const el = containerRef.current;
    if (!el) return { x, y };
    const w = el.clientWidth;
    const h = el.clientHeight;
    // Translation happens around top-left origin: max shift is (s-1)*size
    const maxX = ((s - 1) * w) / 2;
    const maxY = ((s - 1) * h) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  // Zoom toward a focal point in container-local coords (cx, cy from top-left)
  const zoomTo = useCallback(
    (nextScaleRaw: number, cx?: number, cy?: number) => {
      const el = containerRef.current;
      if (!el) return;
      const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScaleRaw));
      const w = el.clientWidth;
      const h = el.clientHeight;
      const fx = cx ?? w / 2;
      const fy = cy ?? h / 2;
      // Keep focal point stationary while scale changes
      // worldPoint = (focal - center - offset) / scale ; we want it constant
      setOffset((prev) => {
        const cxOff = fx - w / 2;
        const cyOff = fy - h / 2;
        const ratio = nextScale / scale;
        const nx = cxOff - (cxOff - prev.x) * ratio;
        const ny = cyOff - (cyOff - prev.y) * ratio;
        return clampOffset(nx, ny, nextScale);
      });
      setScale(nextScale);
    },
    [scale, clampOffset]
  );

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Pointer handlers (mouse + touch + pen, single & multi)
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    // Don't hijack pointer events that start on an interactive marker (single-finger only)
    // so the button's click handler can fire normally. Pinch (2 fingers) still works.
    const target = e.target as HTMLElement | null;
    const onMarker = !!target?.closest('[data-map-marker="true"]');
    if (onMarker && pointersRef.current.size === 0) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      movedRef.current = false;
      return;
    }
    el.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = false;

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      const rect = el.getBoundingClientRect();
      pinchStartRef.current = {
        dist,
        scale,
        cx: (pts[0].x + pts[1].x) / 2 - rect.left,
        cy: (pts[0].y + pts[1].y) / 2 - rect.top,
        ox: offset.x,
        oy: offset.y,
      };
      panStartRef.current = null;
    } else if (pointersRef.current.size === 1) {
      panStartRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchStartRef.current.dist;
      const target = pinchStartRef.current.scale * ratio;
      const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, target));
      const el = containerRef.current!;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cxOff = pinchStartRef.current.cx - w / 2;
      const cyOff = pinchStartRef.current.cy - h / 2;
      const r = nextScale / pinchStartRef.current.scale;
      const nx = cxOff - (cxOff - pinchStartRef.current.ox) * r;
      const ny = cyOff - (cyOff - pinchStartRef.current.oy) * r;
      setScale(nextScale);
      setOffset(clampOffset(nx, ny, nextScale));
      movedRef.current = true;
    } else if (pointersRef.current.size === 1 && panStartRef.current && scale > 1) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
      setOffset(clampOffset(panStartRef.current.ox + dx, panStartRef.current.oy + dy, scale));
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
    if (pointersRef.current.size === 0) panStartRef.current = null;

    // Double-tap to zoom (only on touch / quick taps that didn't pan)
    if (!movedRef.current && pointersRef.current.size === 0) {
      const now = Date.now();
      if (now - lastTapRef.current < 280) {
        const el = containerRef.current!;
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        if (scale >= MAX_SCALE - 0.01) reset();
        else zoomTo(scale * ZOOM_STEP, cx, cy);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    }
  };

  // Trackpad / Ctrl+wheel zoom (desktop)
  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 30) return;
    e.preventDefault();
    const el = containerRef.current!;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * 0.0015);
    zoomTo(scale * factor, cx, cy);
  };

  // Re-clamp when window resizes
  useEffect(() => {
    const onResize = () => setOffset((p) => clampOffset(p.x, p.y, scale));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scale, clampOffset]);

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      className="relative w-full aspect-[4/5] rounded-card overflow-hidden bg-secondary border border-border shadow-elevate-sm touch-none select-none"
      style={{ cursor: scale > 1 ? "grab" : "default" }}
    >
      {/* Zoomable layer */}
      <div
        className="absolute inset-0 origin-center will-change-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: pointersRef.current.size === 0 ? "transform 180ms ease-out" : "none",
        }}
      >
        {/* Map background with paths */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 5 20 Q 30 20 50 15 Q 70 10 95 25" stroke="hsl(var(--neutral-lightgray))" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 5 50 Q 25 45 50 50 Q 75 55 95 45" stroke="hsl(var(--neutral-lightgray))" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 10 80 Q 35 75 50 82 Q 70 88 90 78" stroke="hsl(var(--neutral-lightgray))" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 25 10 Q 22 40 20 60 Q 18 75 15 95" stroke="hsl(var(--brand-navy) / 0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 55 5 Q 50 30 48 50 Q 50 70 52 95" stroke="hsl(var(--brand-navy) / 0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 80 8 Q 78 35 75 55 Q 80 70 82 90" stroke="hsl(var(--brand-navy) / 0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
          {[
            { x: 15, c: "var(--accent-coral)" },
            { x: 35, c: "var(--accent-yellow)" },
            { x: 55, c: "var(--accent-aqua)" },
            { x: 75, c: "var(--accent-coral)" },
          ].map((dot, i) => (
            <circle key={i} cx={dot.x} cy={i % 2 === 0 ? 8 : 92} r="1.2" fill={`hsl(${dot.c})`} opacity="0.65" />
          ))}
        </svg>

        {/* Gate label */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <span className="text-xs font-bold text-primary text-glow tracking-wider">
            🏮 {primary("야시장 입구", "Market Entrance")} 🏮
          </span>
        </div>

        {/* Store markers */}
        {stores.map((store) => {
          const waitClass = waitTimeColorClass(store.waitTime);
          const colors = waitClassMap[waitClass] ?? waitClassMap["text-brand-coral"];
          return (
            <button
              key={store.id}
              type="button"
              data-map-marker="true"
              onClick={(e) => {
                if (movedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                onStoreClick(store);
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ left: `${store.x}%`, top: `${store.y}%` }}
            >
              <div className="relative" style={{ transform: `scale(${1 / Math.max(1, scale * 0.85)})`, transformOrigin: "center" }}>
                <div className={cn("absolute inset-0 rounded-full animate-pulse-glow scale-150", colors.halo)} />
                <div className={cn("relative w-10 h-10 rounded-full bg-card border-2 flex items-center justify-center text-lg shadow-elevate-sm transition-all duration-200 group-hover:scale-110 group-active:scale-95", colors.border)}>
                  {store.emoji}
                </div>
                {store.queueCount > 0 && (
                  <div className={cn("absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white shadow-elevate-sm tabular-nums", colors.bg)}>
                    {store.queueCount}
                  </div>
                )}
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-foreground border border-border">
                  {primary(store.name, store.nameEn)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Zoom controls (Google-Maps style) */}
      <div className="absolute right-2 bottom-2 z-20 flex flex-col rounded-chip overflow-hidden border border-border bg-card/95 backdrop-blur-sm shadow-elevate-md">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomTo(scale * ZOOM_STEP)}
          disabled={scale >= MAX_SCALE - 0.01}
          className="h-9 w-9 flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomTo(scale / ZOOM_STEP)}
          disabled={scale <= MIN_SCALE + 0.01}
          className="h-9 w-9 flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          aria-label="Reset zoom"
          onClick={reset}
          disabled={scale === 1 && offset.x === 0 && offset.y === 0}
          className="h-9 w-9 flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-20 bg-card/85 backdrop-blur-sm rounded-md px-2 py-1 border border-border space-y-0.5">
        <div className="flex items-center gap-2 text-[10px] font-medium text-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-green" />
            {primary("짧음", "Short")}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-yellow" />
            {primary("보통", "Medium")}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-coral" />
            {primary("김", "Long")}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {primary("핀치/더블탭 줌", "Pinch / double-tap to zoom")}
        </p>
      </div>
    </div>
  );
};

export default NightMarketMap;
