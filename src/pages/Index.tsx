import { useState } from "react";
import NightMarketMap from "@/components/NightMarketMap";
import StoreDetail from "@/components/StoreDetail";
import { stores, Store } from "@/data/stores";
import { MapPin, Search } from "lucide-react";

const Index = () => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = stores.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.category.includes(searchQuery) ||
      s.menu.some((m) => m.name.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              🏮 <span className="text-glow">야시장</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 서울 여의도 한강공원
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">영업 중</p>
            <p className="text-xs font-semibold text-primary animate-pulse-glow">● OPEN</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="상점 또는 메뉴 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </header>

      {/* Content */}
      {selectedStore ? (
        <div className="flex-1 flex flex-col">
          <StoreDetail store={selectedStore} onBack={() => setSelectedStore(null)} />
        </div>
      ) : (
        <div className="flex-1 px-4 py-3 flex flex-col gap-4">
          {/* Map */}
          <NightMarketMap stores={filteredStores} onStoreClick={setSelectedStore} />

          {/* Store list */}
          <div>
            <h2 className="text-sm font-bold text-foreground mb-2">🔥 인기 상점</h2>
            <div className="grid grid-cols-2 gap-2">
              {filteredStores
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 4)
                .map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className="bg-card border border-border rounded-lg p-3 text-left hover:border-primary/40 transition-all active:scale-[0.97] group"
                  >
                    <div className="text-2xl mb-1">{store.emoji}</div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {store.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{store.category}</span>
                      <span className="text-[10px] font-medium text-primary">⭐ {store.rating}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
