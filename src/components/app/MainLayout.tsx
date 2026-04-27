import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/app/BottomNav";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { ActiveQueuePill } from "@/components/app/ActiveQueuePill";

export function MainLayout() {
  return (
    <PhoneFrame className="min-h-dvh relative">
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <Outlet />
      </div>
      <ActiveQueuePill />
      <BottomNav />
    </PhoneFrame>
  );
}
