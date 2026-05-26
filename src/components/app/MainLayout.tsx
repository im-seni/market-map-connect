import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/app/BottomNav";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { SpotlightTour } from "@/components/app/SpotlightTour";

export function MainLayout() {
  return (
    <PhoneFrame className="min-h-dvh relative">
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
      <SpotlightTour />
    </PhoneFrame>
  );
}
