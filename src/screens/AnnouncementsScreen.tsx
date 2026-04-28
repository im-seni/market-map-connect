import { useMemo } from "react";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { sortedAnnouncements } from "@/data/announcements";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AnnouncementsScreen() {
  const { primary } = useLanguage();
  const items = useMemo(() => sortedAnnouncements(), []);
  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title={primary("공지사항", "Announcements")} />
      <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g4">
        {items.map((a) => (
          <AnnouncementBanner key={a.id} item={a} />
        ))}
      </div>
    </PhoneFrame>
  );
}
