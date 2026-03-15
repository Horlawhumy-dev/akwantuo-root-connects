import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, Home, Map, Calendar, Archive, AlertTriangle, 
  MapPin, ChevronRight, LogOut, LayoutDashboard, CreditCard,
  Hospital, Bus, CalendarDays, Store, FileCog
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/stays", label: "Stays", icon: Home },
  { to: "/admin/destinations", label: "Destinations", icon: Map },
  { to: "/admin/regions", label: "Regions", icon: MapPin },
  { to: "/admin/festivals", label: "Festivals", icon: Calendar },
  { to: "/admin/archive", label: "Archive", icon: Archive },
  { to: "/admin/safety", label: "Safety Zones", icon: AlertTriangle },
  { to: "/admin/hospitals", label: "Hospitals", icon: Hospital },
  { to: "/admin/transport", label: "Transport", icon: Bus },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/shops", label: "Shops", icon: Store },
  { to: "/admin/pages", label: "Pages", icon: FileCog },
  { to: "/admin/users", label: "Users", icon: Shield },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return data === true;
    },
    enabled: !!user,
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="relative py-12 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Shield className="h-3 w-3 mr-1" /> Admin Dashboard
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">
              {title}
            </h1>
            <p className="text-charcoal-foreground/60 mt-1">{description}</p>
          </motion.div>
        </div>
      </section>

      {/* Navigation + Content */}
      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-56 flex-shrink-0">
              <nav className="bg-card rounded-xl border border-border p-4 space-y-1 sticky top-24">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </Link>
                  );
                })}
                <hr className="my-3 border-border" />
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Exit Admin
                </Link>
              </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </section>
    </div>
  );
}
