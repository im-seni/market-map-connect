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
import NotFound from "./pages/NotFound.tsx";
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
import SplashScreen from "./screens/SplashScreen.tsx";
import LoginScreen from "./screens/LoginScreen.tsx";
import HomeScreen from "./screens/HomeScreen.tsx";
import MapScreen from "./screens/MapScreen.tsx";
import VendorDetailScreen from "./screens/VendorDetailScreen.tsx";
import VendorMenuScreen from "./screens/VendorMenuScreen.tsx";
import ScanScreen from "./screens/ScanScreen.tsx";
import CouponsScreen from "./screens/CouponsScreen.tsx";
import CouponDetailScreen from "./screens/CouponDetailScreen.tsx";
import PaymentMethodsScreen from "./screens/PaymentMethodsScreen.tsx";
import AnnouncementsScreen from "./screens/AnnouncementsScreen.tsx";
import MyPageScreen from "./screens/MyPageScreen.tsx";
import LanguageSettingsScreen from "./screens/LanguageSettingsScreen.tsx";

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
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />

            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/map" element={<MapScreen />} />
              <Route path="/rewards" element={<CouponsScreen />} />
              <Route path="/coupons" element={<CouponsScreen />} />
              <Route path="/my" element={<MyPageScreen />} />
            </Route>

            <Route element={<StackLayout />}>
              <Route path="/scan" element={<ScanScreen />} />
              <Route path="/vendor/:id" element={<VendorDetailScreen />} />
              <Route path="/vendor/:id/menu" element={<VendorMenuScreen />} />
              <Route path="/announcements" element={<AnnouncementsScreen />} />
              <Route path="/my/payment" element={<PaymentMethodsScreen />} />
              <Route path="/my/language" element={<LanguageSettingsScreen />} />
              <Route path="/my/saved" element={<SavedVendorsScreen />} />
              <Route path="/my/history" element={<VisitHistoryScreen />} />
              <Route path="/my/faq" element={<FAQScreen />} />
              <Route path="/my/support" element={<SupportScreen />} />
              <Route path="/my/profile" element={<ProfileScreen />} />
              <Route path="/my/settings" element={<AppSettingsScreen />} />
              <Route path="/coupons/:couponId" element={<CouponDetailScreen />} />
            </Route>

            <Route path="/ds/00-foundation" element={<FoundationPage />} />
            <Route path="/ds/01-components" element={<ComponentsPage />} />
            <Route path="/ds/02-screens" element={<ScreensHubPage />} />
            <Route path="/ds/03-prototype" element={<PrototypePage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
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
