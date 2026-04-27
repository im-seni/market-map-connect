import { StackHeader } from "@/components/app/StackHeader";

export default function VisitHistoryScreen() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <StackHeader title="방문 기록 · Visit history" />
      <div className="flex-1 flex flex-col items-center justify-center px-g6 text-center">
        <p className="type-title text-foreground">준비 중 · Coming soon</p>
        <p className="type-body text-muted-foreground mt-g3">
          최근 방문한 상점이 여기에 표시됩니다 · Your recently visited vendors will appear here.
        </p>
      </div>
    </div>
  );
}
