import { useState } from "react";
import { Store } from "@/data/stores";
import { Star, Clock, Users, ChevronLeft, Ticket } from "lucide-react";

interface StoreDetailProps {
  store: Store;
  onBack: () => void;
}

const StoreDetail = ({ store, onBack }: StoreDetailProps) => {
  const [isQueued, setIsQueued] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [localQueueCount, setLocalQueueCount] = useState(store.queueCount);

  const handleQueue = () => {
    if (!isQueued) {
      const number = localQueueCount + 1;
      setQueueNumber(number);
      setLocalQueueCount(number);
      setIsQueued(true);
    }
  };

  const handleCancelQueue = () => {
    setIsQueued(false);
    setQueueNumber(null);
    setLocalQueueCount((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={onBack} className="p-1 rounded-md hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {store.emoji} {store.name}
          </h2>
          <p className="text-xs text-muted-foreground">{store.category}</p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Star className="w-4 h-4 fill-primary" />
          <span className="text-sm font-semibold">{store.rating}</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Description */}
        <div className="px-4 py-3">
          <p className="text-sm text-secondary-foreground leading-relaxed">{store.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-3">
          <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">예상 대기</p>
              <p className="text-sm font-semibold text-foreground">{store.waitTime}분</p>
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">대기 중</p>
              <p className="text-sm font-semibold text-foreground">{localQueueCount}명</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">📋 메뉴</h3>
          <div className="space-y-2">
            {store.menu.map((item, idx) => (
              <div
                key={idx}
                className="bg-secondary/60 rounded-lg p-3 flex items-start justify-between border border-border/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    {item.popular && (
                      <span className="text-[10px] font-semibold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        인기
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <span className="text-sm font-bold text-primary ml-3 whitespace-nowrap">
                  {item.price.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queue CTA */}
      <div className="px-4 py-3 border-t border-border bg-card">
        {isQueued ? (
          <div className="space-y-2">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center glow-amber-sm">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Ticket className="w-5 h-5 text-primary" />
                <span className="text-lg font-black text-primary text-glow">#{queueNumber}</span>
              </div>
              <p className="text-xs text-muted-foreground">대기번호가 발급되었습니다</p>
              <p className="text-xs text-secondary-foreground mt-1">
                예상 대기시간: <span className="font-semibold text-primary">{store.waitTime}분</span>
              </p>
            </div>
            <button
              onClick={handleCancelQueue}
              className="w-full py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-secondary transition-colors"
            >
              대기 취소
            </button>
          </div>
        ) : (
          <button
            onClick={handleQueue}
            className="w-full py-3 rounded-lg text-sm font-bold bg-primary text-primary-foreground glow-amber transition-all hover:brightness-110 active:scale-[0.98]"
          >
            🎫 줄서기 ({localQueueCount}명 대기 중)
          </button>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;
