import { StackHeader } from "@/components/app/StackHeader";

function Placeholder({ ko, en, message }: { ko: string; en: string; message?: string }) {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <StackHeader title={`${ko} · ${en}`} />
      <div className="flex-1 flex flex-col items-center justify-center px-g6 text-center">
        <p className="type-title text-foreground">준비 중 · Coming soon</p>
        <p className="type-body text-muted-foreground mt-g3">
          {message ?? "이 페이지는 곧 제공됩니다 · This page will be available soon."}
        </p>
      </div>
    </div>
  );
}

export default function SavedVendorsScreen() {
  return <Placeholder ko="저장한 상점" en="Saved vendors" />;
}
