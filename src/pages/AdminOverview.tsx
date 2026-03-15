import { motion } from "framer-motion";
import { Home, Map, MapPin, Calendar, Archive, AlertTriangle, Users, Clock, BedDouble, UserPlus, MessageSquare } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statCards = [
  { key: "stays", label: "Total Stays", icon: Home, to: "/admin/stays", color: "text-amber-600 bg-amber-100" },
  { key: "pending", label: "Pending Stays", icon: Clock, to: "/admin/stays", color: "text-yellow-600 bg-yellow-100" },
  { key: "destinations", label: "Destinations", icon: Map, to: "/admin/destinations", color: "text-emerald-600 bg-emerald-100" },
  { key: "regions", label: "Regions", icon: MapPin, to: "/admin/regions", color: "text-blue-600 bg-blue-100" },
  { key: "festivals", label: "Festivals", icon: Calendar, to: "/admin/festivals", color: "text-purple-600 bg-purple-100" },
  { key: "archive", label: "Archive Items", icon: Archive, to: "/admin/archive", color: "text-orange-600 bg-orange-100" },
  { key: "safety", label: "Safety Zones", icon: AlertTriangle, to: "/admin/safety", color: "text-red-600 bg-red-100" },
  { key: "users", label: "Users", icon: Users, color: "text-indigo-600 bg-indigo-100" },
];

type ActivityItem = {
  id: string;
  type: "stay" | "booking" | "signup";
  title: string;
  subtitle: string;
  timestamp: string;
  status?: string;
};

export default function AdminOverview() {
  const { data: counts = {}, isLoading } = useQuery({
    queryKey: ["admin-overview-counts"],
    queryFn: async () => {
      const [stays, pending, destinations, regions, festivals, archive, safety, users] = await Promise.all([
        supabase.from("stays").select("id", { count: "exact", head: true }),
        supabase.from("stays").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("destinations").select("id", { count: "exact", head: true }),
        supabase.from("regions").select("id", { count: "exact", head: true }),
        supabase.from("festivals").select("id", { count: "exact", head: true }),
        supabase.from("archive_items").select("id", { count: "exact", head: true }),
        supabase.from("safety_zones").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        stays: stays.count ?? 0,
        pending: pending.count ?? 0,
        destinations: destinations.count ?? 0,
        regions: regions.count ?? 0,
        festivals: festivals.count ?? 0,
        archive: archive.count ?? 0,
        safety: safety.count ?? 0,
        users: users.count ?? 0,
      } as Record<string, number>;
    },
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const [staysRes, bookingsRes, signupsRes] = await Promise.all([
        supabase
          .from("stays")
          .select("id, name, status, host_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("booking_requests")
          .select("id, status, created_at, guests, stays(name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("profiles")
          .select("id, display_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const items: ActivityItem[] = [];

      (staysRes.data ?? []).forEach((s) =>
        items.push({
          id: `stay-${s.id}`,
          type: "stay",
          title: s.name,
          subtitle: `Submitted by ${s.host_name}`,
          timestamp: s.created_at,
          status: s.status,
        })
      );

      (bookingsRes.data ?? []).forEach((b) => {
        const stayName = (b.stays as any)?.name ?? "Unknown stay";
        items.push({
          id: `booking-${b.id}`,
          type: "booking",
          title: `Booking for ${stayName}`,
          subtitle: `${b.guests} guest${b.guests > 1 ? "s" : ""}`,
          timestamp: b.created_at,
          status: b.status,
        });
      });

      (signupsRes.data ?? []).forEach((p) =>
        items.push({
          id: `signup-${p.id}`,
          type: "signup",
          title: p.display_name ?? "New user",
          subtitle: "Joined the platform",
          timestamp: p.created_at,
        })
      );

      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    },
  });

  const activityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "stay": return <BedDouble className="h-4 w-4" />;
      case "booking": return <MessageSquare className="h-4 w-4" />;
      case "signup": return <UserPlus className="h-4 w-4" />;
    }
  };

  const activityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "stay": return "text-amber-600 bg-amber-100";
      case "booking": return "text-blue-600 bg-blue-100";
      case "signup": return "text-emerald-600 bg-emerald-100";
    }
  };

  const statusBadge = (status?: string) => {
    if (!status) return null;
    const variant = status === "approved" || status === "accepted" ? "default" : status === "pending" ? "secondary" : "destructive";
    return <Badge variant={variant} className="text-xs capitalize">{status}</Badge>;
  };

  return (
    <AdminLayout title="Admin Overview" description="Platform stats and quick navigation">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const count = counts[card.key] ?? "—";
          const inner = (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "bg-card rounded-xl border border-border p-5 flex items-center gap-4 transition-shadow",
                card.to && "hover:shadow-md cursor-pointer"
              )}
            >
              <div className={cn("rounded-lg p-3", card.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-7 w-12 bg-muted rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl font-display font-bold">{count}</p>
                )}
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </motion.div>
          );

          return card.to ? (
            <Link key={card.key} to={card.to}>{inner}</Link>
          ) : (
            <div key={card.key}>{inner}</div>
          );
        })}
      </div>

      {/* Recent Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <h2 className="font-display text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {activityLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : activity.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground text-sm">No recent activity yet.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className={cn("rounded-lg p-2 flex-shrink-0", activityColor(item.type))}>
                  {activityIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusBadge(item.status)}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
}
