import { useState } from "react";
import { motion } from "framer-motion";
import { Store, CheckCircle, XCircle, Clock, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Link } from "react-router-dom";

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  pending: { icon: <Clock className="h-3.5 w-3.5" />, color: "bg-primary/10 text-primary" },
  approved: { icon: <CheckCircle className="h-3.5 w-3.5" />, color: "bg-kente-green/10 text-kente-green" },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, color: "bg-destructive/10 text-destructive" },
};

export default function AdminShops() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("pending");

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["admin-shops", filter],
    queryFn: async () => {
      let q = supabase.from("shops").select("*, shop_products(count)").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter as "pending" | "approved" | "rejected");
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("shops").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
      toast({ title: "Updated", description: "Shop status updated." });
    },
  });

  return (
    <AdminLayout title="Shops" description="Review and manage marketplace listings">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : shops.length === 0 ? (
        <p className="text-muted-foreground">No shops found.</p>
      ) : (
        <div className="space-y-3">
          {shops.map((shop: any) => {
            const sc = statusConfig[shop.status] || statusConfig.pending;
            return (
              <motion.div key={shop.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-card rounded-xl border border-border p-5 flex items-start gap-4"
              >
                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {shop.image_urls?.[0] ? (
                    <img src={shop.image_urls[0]} alt={shop.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Store className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold">{shop.name}</h3>
                    <Badge className={`text-[10px] border-0 ${sc.color} flex items-center gap-1`}>
                      {sc.icon} {shop.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{shop.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{shop.region}, {shop.country}</span>
                    <span>{shop.category}</span>
                    <span>{shop.shop_products?.[0]?.count ?? 0} products</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {shop.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="text-kente-green border-kente-green/30"
                        onClick={() => updateStatus.mutate({ id: shop.id, status: "approved" })}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30"
                        onClick={() => updateStatus.mutate({ id: shop.id, status: "rejected" })}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {shop.status === "approved" && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/marketplace/${shop.id}`}><Eye className="h-3.5 w-3.5 mr-1" /> View</Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
