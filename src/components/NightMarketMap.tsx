import { Store } from "@/data/stores";

interface NightMarketMapProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
}

const NightMarketMap = ({ stores, onStoreClick }: NightMarketMapProps) => {
  return (
    <div className="relative w-full aspect-[4/5] md:aspect-[16/10] rounded-lg overflow-hidden bg-secondary border border-border">
      {/* Map background with paths */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Main paths */}
        <path d="M 5 20 Q 30 20 50 15 Q 70 10 95 25" stroke="hsl(20 8% 25%)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 5 50 Q 25 45 50 50 Q 75 55 95 45" stroke="hsl(20 8% 25%)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 10 80 Q 35 75 50 82 Q 70 88 90 78" stroke="hsl(20 8% 25%)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Vertical paths */}
        <path d="M 25 10 Q 22 40 20 60 Q 18 75 15 95" stroke="hsl(20 8% 22%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 55 5 Q 50 30 48 50 Q 50 70 52 95" stroke="hsl(20 8% 22%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 80 8 Q 78 35 75 55 Q 80 70 82 90" stroke="hsl(20 8% 22%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Decorative lanterns along the path */}
        {[15, 35, 55, 75].map((x, i) => (
          <circle key={i} cx={x} cy={i % 2 === 0 ? 8 : 92} r="1" fill="hsl(0 70% 50%)" opacity="0.5" />
        ))}
      </svg>

      {/* Gate label */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <span className="text-xs md:text-sm font-bold text-primary text-glow tracking-wider">🏮 야시장 입구 🏮</span>
      </div>

      {/* Store markers */}
      {stores.map((store) => (
        <button
          key={store.id}
          onClick={() => onStoreClick(store)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
          style={{ left: `${store.x}%`, top: `${store.y}%` }}
        >
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow scale-150" />
            {/* Marker */}
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border-2 border-primary/60 flex items-center justify-center text-lg md:text-xl glow-amber-sm transition-all duration-200 group-hover:scale-110 group-hover:border-primary group-active:scale-95">
              {store.emoji}
            </div>
            {/* Queue badge */}
            {store.queueCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-accent flex items-center justify-center text-[10px] md:text-xs font-bold text-accent-foreground glow-red">
                {store.queueCount}
              </div>
            )}
            {/* Name tooltip */}
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] md:text-xs font-medium text-foreground border border-border">
              {store.name}
            </div>
          </div>
        </button>
      ))}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border">
        <p className="text-[10px] text-muted-foreground">🔴 대기 인원 · 터치하여 상세보기</p>
      </div>
    </div>
  );
};

export default NightMarketMap;
