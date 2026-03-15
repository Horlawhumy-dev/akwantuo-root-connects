import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, BarChart3, Star, DollarSign, TrendingUp, Users, Home, CreditCard, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function HostDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: hostStays = [] } = useQuery({
    queryKey: ["host-stays-dashboard", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("stays")
        .select("id, name, region, country, status, price_per_night")
        .eq("host_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["host-all-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*, stays:stay_id(name, price_per_night)")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["host-payments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const stayIds = hostStays.map((s) => s.id);
      if (stayIds.length === 0) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*, booking_requests:booking_request_id(stay_id)")
        .eq("status", "success");
      if (error) throw error;
      // Filter to payments for host's stays
      return (data || []).filter((p: any) => {
        const stayId = p.booking_requests?.stay_id;
        return stayIds.includes(stayId);
      });
    },
    enabled: !!user && hostStays.length > 0,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["host-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const stayIds = hostStays.map((s) => s.id);
      if (stayIds.length === 0) return [];
      const { data, error } = await supabase
        .from("stay_reviews")
        .select("*")
        .in("stay_id", stayIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && hostStays.length > 0,
  });

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!user) { navigate("/login"); return null; }

  const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const confirmedBookings = allBookings.filter((b: any) => b.status === "accepted").length;
  const cancelledBookings = allBookings.filter((b: any) => b.status === "cancelled").length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "N/A";

  // Monthly revenue for last 6 months
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const monthPayments = payments.filter((p: any) => {
      const paidAt = p.paid_at ? new Date(p.paid_at) : null;
      return paidAt && paidAt >= start && paidAt <= end;
    });
    return {
      month: format(month, "MMM"),
      revenue: monthPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0),
    };
  });

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  return (
    <div>
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <BarChart3 className="h-3 w-3 mr-1" /> Host Analytics
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">Dashboard</h1>
            <p className="text-charcoal-foreground/60 mt-1">Track your performance and revenue</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <DollarSign className="h-5 w-5" />, label: "Total Revenue", value: `GH₵${(totalRevenue / 100).toLocaleString()}`, color: "text-kente-green" },
              { icon: <Calendar className="h-5 w-5" />, label: "Confirmed Bookings", value: confirmedBookings.toString(), color: "text-primary" },
              { icon: <Star className="h-5 w-5" />, label: "Avg Rating", value: avgRating, color: "text-primary" },
              { icon: <Home className="h-5 w-5" />, label: "Active Stays", value: hostStays.filter(s => s.status === "approved").length.toString(), color: "text-accent" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Revenue (6 months)
              </h3>
              <div className="flex items-end gap-2 h-40">
                {monthlyRevenue.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      {m.revenue > 0 ? `₵${(m.revenue / 100).toLocaleString()}` : ""}
                    </span>
                    <div
                      className="w-full bg-primary/80 rounded-t-md transition-all"
                      style={{ height: `${Math.max((m.revenue / maxRevenue) * 120, 4)}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground font-medium">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" /> Recent Reviews ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                  {reviews.slice(0, 10).map((r: any) => (
                    <div key={r.id} className="border-b border-border last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-2">
                          {format(new Date(r.created_at), "MMM d")}
                        </span>
                      </div>
                      {r.comment && <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-3 mt-6">
            <Button asChild variant="outline">
              <Link to="/host/bookings">View All Bookings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/stays/submit">List New Stay</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
