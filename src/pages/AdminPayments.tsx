import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, CheckCircle2, Clock, XCircle, DollarSign, Search } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="h-3 w-3" />, label: "Pending" },
  success: { color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="h-3 w-3" />, label: "Paid" },
  failed: { color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="h-3 w-3" />, label: "Failed" },
};

export default function AdminPayments() {
  const [tab, setTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-payments", tab],
    queryFn: async () => {
      let query = (supabase as any)
        .from("payments")
        .select(`*, booking_requests:booking_request_id(check_in, check_out, guests, guest_id, stays:stay_id(name, region, country))`)
        .order("created_at", { ascending: false });
      if (tab !== "all") query = query.eq("status", tab);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: async () => {
      const [all, success, pending, failed] = await Promise.all([
        (supabase as any).from("payments").select("amount", { count: "exact" }),
        (supabase as any).from("payments").select("amount").eq("status", "success"),
        (supabase as any).from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
        (supabase as any).from("payments").select("id", { count: "exact", head: true }).eq("status", "failed"),
      ]);
      const totalRevenue = (success.data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      return { total: all.count || 0, revenue: totalRevenue, pending: pending.count || 0, failed: failed.count || 0 };
    },
  });

  const filtered = searchQuery
    ? payments.filter((p: any) => {
        const q = searchQuery.toLowerCase();
        return (
          (p.booking_requests?.stays?.name || "").toLowerCase().includes(q) ||
          (p.booking_requests?.stays?.region || "").toLowerCase().includes(q) ||
          (p.booking_requests?.stays?.country || "").toLowerCase().includes(q) ||
          (p.provider_reference || "").toLowerCase().includes(q)
        );
      })
    : payments;

  return (
    <AdminLayout title="Payments" description="View and manage all payment transactions">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Transactions", value: stats?.total || 0, icon: CreditCard, color: "text-blue-600 bg-blue-100" },
          { label: "Total Revenue", value: `GH₵${((stats?.revenue || 0) / 100).toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-100" },
          { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
          { label: "Failed", value: stats?.failed || 0, icon: XCircle, color: "text-red-600 bg-red-100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by stay name, reference, or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="success">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{searchQuery ? "No matching payments found" : `No ${tab === "all" ? "" : tab} payments found`}</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium">Stay</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Provider</th>
                      <th className="text-left p-3 font-medium">Reference</th>
                      <th className="text-left p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payment: any) => {
                      const config = statusConfig[payment.status] || statusConfig.pending;
                      return (
                        <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-3">
                            <p className="font-medium">{payment.booking_requests?.stays?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{payment.booking_requests?.stays?.region}, {payment.booking_requests?.stays?.country}</p>
                          </td>
                          <td className="p-3 font-medium">GH₵{(payment.amount / 100).toLocaleString()}</td>
                          <td className="p-3"><Badge className={`${config.color} border text-xs gap-1`}>{config.icon} {config.label}</Badge></td>
                          <td className="p-3 capitalize">{payment.provider}</td>
                          <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{payment.provider_reference ? payment.provider_reference.slice(0, 20) + "..." : "—"}</code></td>
                          <td className="p-3 text-muted-foreground">{format(new Date(payment.created_at), "MMM d, yyyy HH:mm")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
