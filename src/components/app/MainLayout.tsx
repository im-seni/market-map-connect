import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/app/BottomNav";
import { PhoneFrame } from "@/components/app/PhoneFrame";

export function MainLayout() {
  return (
    <PhoneFrame className="min-h-dvh">
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
