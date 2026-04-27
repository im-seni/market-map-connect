import { Mail, MessageCircle, Phone } from "lucide-react";
import { StackHeader } from "@/components/app/StackHeader";

export default function SupportScreen() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <StackHeader title="고객센터 · Customer service" />
      <div className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g3">
        <a href="tel:+8201012345678" className="flex items-center gap-g3 rounded-card border border-border bg-card p-g4 shadow-elevate-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-brand-royal/10 text-brand-royal">
            <Phone className="h-5 w-5" />
          </span>
          <div>
            <p className="type-body font-semibold">전화 상담 · Phone</p>
            <p className="type-caption text-muted-foreground">010-1234-5678 · 평일 10–18시</p>
          </div>
        </a>
        <a href="mailto:help@jemulpogu.market" className="flex items-center gap-g3 rounded-card border border-border bg-card p-g4 shadow-elevate-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-accent-aqua/15 text-brand-royal">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <p className="type-body font-semibold">이메일 · Email</p>
            <p className="type-caption text-muted-foreground">help@jemulpogu.market</p>
          </div>
        </a>
        <button type="button" className="w-full text-left flex items-center gap-g3 rounded-card border border-border bg-card p-g4 shadow-elevate-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-accent-yellow/20 text-foreground">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="type-body font-semibold">채팅 상담 · Live chat</p>
            <p className="type-caption text-muted-foreground">곧 제공 예정 · Coming soon</p>
          </div>
        </button>
      </div>
    </div>
  );
}
