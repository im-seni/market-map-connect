import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/app/MainLayout";
import { StackLayout } from "@/components/app/StackLayout";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueueProvider } from "@/contexts/QueueContext";
import { CouponsProvider } from "@/contexts/CouponsContext";
import { RewardsProvider } from "@/contexts/RewardsContext";
import { SavedStoresProvider } from "@/contexts/SavedStoresContext";
import NotFound from "./pages/NotFound.tsx";
import SplashScreen from "./screens/SplashScreen.tsx";
import LoginScreen from "./screens/LoginScreen.tsx";
import AuthLoginScreen from "./screens/auth/AuthLoginScreen.tsx";
import AuthSignUpScreen from "./screens/auth/AuthSignUpScreen.tsx";
import DiningMapsScreen from "./screens/DiningMapsScreen.tsx";
import WaitingScreen from "./screens/WaitingScreen.tsx";
import WaitingWalkRouteScreen from "./screens/WaitingWalkRouteScreen.tsx";
import QueueAlertsScreen from "./screens/QueueAlertsScreen.tsx";
import EventScreen from "./screens/EventScreen.tsx";
import CouponsScreen from "./screens/CouponsScreen.tsx";
import MyPageScreen from "./screens/MyPageScreen.tsx";
import VendorDetailScreen from "./screens/VendorDetailScreen.tsx";
import VendorMenuScreen from "./screens/VendorMenuScreen.tsx";
import ScanScreen from "./screens/ScanScreen.tsx";
import CouponDetailScreen from "./screens/CouponDetailScreen.tsx";
import AnnouncementsScreen from "./screens/AnnouncementsScreen.tsx";
import PaymentMethodsScreen from "./screens/PaymentMethodsScreen.tsx";
import LanguageSettingsScreen from "./screens/LanguageSettingsScreen.tsx";
import SavedVendorsScreen from "./screens/SavedVendorsScreen.tsx";
import VisitHistoryScreen from "./screens/VisitHistoryScreen.tsx";
import FAQScreen from "./screens/FAQScreen.tsx";
import SupportScreen from "./screens/SupportScreen.tsx";
import ProfileScreen from "./screens/ProfileScreen.tsx";
import AppSettingsScreen from "./screens/AppSettingsScreen.tsx";
import FoundationPage from "./pages/ds/00_Foundation.tsx";
import ComponentsPage from "./pages/ds/01_Components.tsx";
import ScreensHubPage from "./pages/ds/02_Screens.tsx";
import PrototypePage from "./pages/ds/03_Prototype.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <QueueProvider>
          <CouponsProvider>
          <RewardsProvider>
          <SavedStoresProvider>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />

            <Route element={<MainLayout />}>
              <Route path="/map"     element={<DiningMapsScreen />} />
              <Route path="/waiting" element={<WaitingScreen />} />
              <Route path="/queue-alerts" element={<QueueAlertsScreen />} />
              <Route path="/event"   element={<EventScreen />} />
              <Route path="/rewards" element={<CouponsScreen />} />
              <Route path="/coupons" element={<CouponsScreen />} />
              <Route path="/my"      element={<MyPageScreen />} />
            </Route>

            <Route element={<StackLayout />}>
              <Route path="/scan"              element={<ScanScreen />} />
              <Route path="/vendor/:id"        element={<VendorDetailScreen />} />
              <Route path="/vendor/:id/menu"   element={<VendorMenuScreen />} />
              <Route path="/announcements"     element={<AnnouncementsScreen />} />
              <Route path="/my/payment"        element={<PaymentMethodsScreen />} />
              <Route path="/my/language"       element={<LanguageSettingsScreen />} />
              <Route path="/my/saved"          element={<SavedVendorsScreen />} />
              <Route path="/my/history"        element={<VisitHistoryScreen />} />
              <Route path="/my/faq"            element={<FAQScreen />} />
              <Route path="/my/support"        element={<SupportScreen />} />
              <Route path="/my/profile"        element={<ProfileScreen />} />
              <Route path="/my/settings"       element={<AppSettingsScreen />} />
              <Route path="/coupons/:couponId" element={<CouponDetailScreen />} />
              <Route path="/waiting/walk-route" element={<WaitingWalkRouteScreen />} />
              <Route path="/auth/login" element={<AuthLoginScreen />} />
              <Route path="/auth/sign-up" element={<AuthSignUpScreen />} />
            </Route>

            <Route path="/ds/00-foundation" element={<FoundationPage />} />
            <Route path="/ds/01-components" element={<ComponentsPage />} />
            <Route path="/ds/02-screens"    element={<ScreensHubPage />} />
            <Route path="/ds/03-prototype"  element={<PrototypePage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </SavedStoresProvider>
          </RewardsProvider>
          </CouponsProvider>
          </QueueProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
