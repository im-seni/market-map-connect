import { Outlet } from "react-router-dom";
import { PhoneFrame } from "@/components/app/PhoneFrame";

/**
 * Layout for sub/stack pages: wraps content in the mobile PhoneFrame
 * but omits the BottomNav (those pages use a back-button StackHeader).
 */
export function StackLayout() {
  return (
    <PhoneFrame className="min-h-dvh">
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </PhoneFrame>
  );
}
