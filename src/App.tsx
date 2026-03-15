import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminRouteGuard } from "@/components/AdminRouteGuard";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Destinations from "./pages/Destinations";
import CountryDetail from "./pages/CountryDetail";
import RegionDetail from "./pages/RegionDetail";
import Archive from "./pages/Archive";
import ArchiveDetail from "./pages/ArchiveDetail";
import ArchiveCountryDetail from "./pages/ArchiveCountryDetail";
import Festivals from "./pages/Festivals";
import Safety from "./pages/Safety";
import TravelEssentials from "./pages/TravelEssentials";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Stays from "./pages/Stays";
import StayDetail from "./pages/StayDetail";
import SubmitStay from "./pages/SubmitStay";
import EditStay from "./pages/EditStay";
import AdminOverview from "./pages/AdminOverview";
import AdminStays from "./pages/AdminStays";
import AdminDestinations from "./pages/AdminDestinations";
import AdminRegions from "./pages/AdminRegions";
import AdminFestivals from "./pages/AdminFestivals";
import AdminArchive from "./pages/AdminArchive";
import AdminSafety from "./pages/AdminSafety";
import AdminPayments from "./pages/AdminPayments";
import AdminHospitals from "./pages/AdminHospitals";
import AdminTransport from "./pages/AdminTransport";
import AdminEvents from "./pages/AdminEvents";
import HostBookings from "./pages/HostBookings";
import HostDashboard from "./pages/HostDashboard";
import GuestBookings from "./pages/GuestBookings";
import PaymentVerify from "./pages/PaymentVerify";
import Wishlist from "./pages/Wishlist";
import Itineraries from "./pages/Itineraries";
import ItineraryDetail from "./pages/ItineraryDetail";
import AiTripPlanner from "./pages/AiTripPlanner";
import Marketplace from "./pages/Marketplace";
import ShopDetail from "./pages/ShopDetail";
import SubmitShop from "./pages/SubmitShop";
import AdminShops from "./pages/AdminShops";
import AdminUsers from "./pages/AdminUsers";
import MyShops from "./pages/MyShops";
import EditShopPage from "./pages/EditShop";
import FestivalDetail from "./pages/FestivalDetail";
import EventDetail from "./pages/EventDetail";
import NotFound from "./pages/NotFound";
import AdminPages from "./pages/AdminPages";
import { PageGuard } from "@/components/PageGuard";

const queryClient = new QueryClient();

function AdminPage({ children }: { children: React.ReactNode }) {
  return <AdminRouteGuard>{children}</AdminRouteGuard>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/destinations" element={<PageGuard slug="destinations"><Destinations /></PageGuard>} />
                <Route path="/destinations/:countryId" element={<PageGuard slug="destinations"><CountryDetail /></PageGuard>} />
                <Route path="/destinations/:countryId/:regionId" element={<PageGuard slug="destinations"><RegionDetail /></PageGuard>} />
                <Route path="/archive" element={<PageGuard slug="archive"><Archive /></PageGuard>} />
                <Route path="/archive/country/:countrySlug" element={<PageGuard slug="archive"><ArchiveCountryDetail /></PageGuard>} />
                <Route path="/archive/:id" element={<PageGuard slug="archive"><ArchiveDetail /></PageGuard>} />
                <Route path="/festivals" element={<PageGuard slug="festivals"><Festivals /></PageGuard>} />
                <Route path="/festivals/:id" element={<PageGuard slug="festivals"><FestivalDetail /></PageGuard>} />
                <Route path="/safety" element={<PageGuard slug="safety"><Safety /></PageGuard>} />
                <Route path="/travel-essentials" element={<PageGuard slug="travel-essentials"><TravelEssentials /></PageGuard>} />
                <Route path="/events" element={<PageGuard slug="events"><Events /></PageGuard>} />
                <Route path="/events/:id" element={<PageGuard slug="events"><EventDetail /></PageGuard>} />
                <Route path="/stays" element={<PageGuard slug="stays"><Stays /></PageGuard>} />
                <Route path="/stays/:id" element={<PageGuard slug="stays"><StayDetail /></PageGuard>} />
                <Route path="/stays/submit" element={<PageGuard slug="stays"><SubmitStay /></PageGuard>} />
                <Route path="/stays/:id/edit" element={<PageGuard slug="stays"><EditStay /></PageGuard>} />
                <Route path="/host/bookings" element={<HostBookings />} />
                <Route path="/host/dashboard" element={<HostDashboard />} />
                <Route path="/my-bookings" element={<GuestBookings />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/itineraries" element={<PageGuard slug="itineraries"><Itineraries /></PageGuard>} />
                <Route path="/itineraries/:id" element={<PageGuard slug="itineraries"><ItineraryDetail /></PageGuard>} />
                <Route path="/marketplace" element={<PageGuard slug="marketplace"><Marketplace /></PageGuard>} />
                <Route path="/marketplace/:id" element={<PageGuard slug="marketplace"><ShopDetail /></PageGuard>} />
                <Route path="/marketplace/submit" element={<PageGuard slug="marketplace"><SubmitShop /></PageGuard>} />
                <Route path="/marketplace/my-shops" element={<PageGuard slug="marketplace"><MyShops /></PageGuard>} />
                <Route path="/marketplace/:id/edit" element={<PageGuard slug="marketplace"><EditShopPage /></PageGuard>} />
                <Route path="/trip-planner" element={<PageGuard slug="trip-planner"><AiTripPlanner /></PageGuard>} />
                <Route path="/payment/verify" element={<PaymentVerify />} />
                <Route path="/admin" element={<AdminPage><AdminOverview /></AdminPage>} />
                <Route path="/admin/stays" element={<AdminPage><AdminStays /></AdminPage>} />
                <Route path="/admin/destinations" element={<AdminPage><AdminDestinations /></AdminPage>} />
                <Route path="/admin/regions" element={<AdminPage><AdminRegions /></AdminPage>} />
                <Route path="/admin/festivals" element={<AdminPage><AdminFestivals /></AdminPage>} />
                <Route path="/admin/archive" element={<AdminPage><AdminArchive /></AdminPage>} />
                <Route path="/admin/safety" element={<AdminPage><AdminSafety /></AdminPage>} />
                <Route path="/admin/payments" element={<AdminPage><AdminPayments /></AdminPage>} />
                <Route path="/admin/hospitals" element={<AdminPage><AdminHospitals /></AdminPage>} />
                <Route path="/admin/transport" element={<AdminPage><AdminTransport /></AdminPage>} />
                <Route path="/admin/events" element={<AdminPage><AdminEvents /></AdminPage>} />
                <Route path="/admin/shops" element={<AdminPage><AdminShops /></AdminPage>} />
                <Route path="/admin/users" element={<AdminPage><AdminUsers /></AdminPage>} />
                <Route path="/admin/pages" element={<AdminPage><AdminPages /></AdminPage>} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
