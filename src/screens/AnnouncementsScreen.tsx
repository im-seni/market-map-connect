import { useMemo } from "react";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { sortedAnnouncements } from "@/data/announcements";

export default function AnnouncementsScreen() {
  const items = useMemo(() => sortedAnnouncements(), []);
  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title="공지 · 행사 · Announcements" />
      <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g4">
        <p className="type-caption text-muted-foreground">
          오늘의 일정 · Closures · 긴급 안내 · Tonight’s program
        </p>
        {items.map((a) => (
          <AnnouncementBanner key={a.id} item={a} />
        ))}
      </div>
    </PhoneFrame>
  );
}

