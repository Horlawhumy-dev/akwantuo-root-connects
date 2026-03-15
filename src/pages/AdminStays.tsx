import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, MapPin, Clock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const typeLabels: Record<string, string> = {
  guesthouse: "Guest House",
  boutique_hotel: "Boutique Hotel",
  homestay: "Homestay",
};

const priceLabels: Record<string, string> = {
  budget: "Budget ($)",
  mid_range: "Mid-Range ($$)",
  luxury: "Luxury ($$$)",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminStays() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewStay, setPreviewStay] = useState<any>(null);
  const [tab, setTab] = useState("pending");

  // Fetch all stays (admin sees all via RLS)
  const { data: stays = [], isLoading } = useQuery({
    queryKey: ["admin-stays", tab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stays")
        .select("*")
        .eq("status", tab as "pending" | "approved" | "rejected")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("stays")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === "approved" ? "Stay approved" : "Stay rejected",
        description: status === "approved"
          ? "The listing is now visible to the public."
          : "The listing has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-stays"] });
      setPreviewStay(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AdminLayout title="Manage Stay Listings" description="Review, approve, or reject stay submissions from hosts">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" /> Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <Check className="h-4 w-4" /> Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <X className="h-4 w-4" /> Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                      <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : stays.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <p className="text-muted-foreground">No {tab} stays</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stays.map((stay: any) => (
                    <div
                      key={stay.id}
                      className="bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row gap-4"
                    >
                      {/* Image */}
                      <div className="w-full md:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                        {stay.image_urls?.[0] ? (
                          <img src={stay.image_urls[0]} alt={stay.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Home className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-display text-lg font-semibold truncate">{stay.name}</h3>
                          <Badge className={`${statusColors[stay.status]} border text-xs flex-shrink-0`}>
                            {stay.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {stay.region}, {stay.country}
                          </span>
                          <span>{typeLabels[stay.type]}</span>
                          <span>{priceLabels[stay.price_range]}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{stay.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Host: {stay.host_name} · Submitted {new Date(stay.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setPreviewStay(stay)}>
                          <Eye className="h-4 w-4 mr-1" /> Preview
                        </Button>
                        {stay.status !== "approved" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: stay.id, status: "approved" })}
                            disabled={updateStatus.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        )}
                        {stay.status !== "rejected" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: stay.id, status: "rejected" })}
                            disabled={updateStatus.isPending}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewStay} onOpenChange={() => setPreviewStay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewStay && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{previewStay.name}</DialogTitle>
                <DialogDescription>
                  {typeLabels[previewStay.type]} · {previewStay.region}, {previewStay.country} · {priceLabels[previewStay.price_range]}
                </DialogDescription>
              </DialogHeader>

              {previewStay.image_urls?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {previewStay.image_urls.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" className="rounded-lg w-full h-32 object-cover" />
                  ))}
                </div>
              )}

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-line">{previewStay.description}</p>
                </div>

                {previewStay.amenities?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Amenities</h4>
                    <div className="flex flex-wrap gap-1">
                      {previewStay.amenities.map((a: string) => (
                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-1">Host</h4>
                  <p className="text-muted-foreground">{previewStay.host_name}</p>
                  {previewStay.host_bio && <p className="text-muted-foreground mt-1">{previewStay.host_bio}</p>}
                </div>

                <div>
                  <h4 className="font-medium mb-1">Contact</h4>
                  {previewStay.contact_email && <p className="text-muted-foreground">{previewStay.contact_email}</p>}
                  {previewStay.contact_phone && <p className="text-muted-foreground">{previewStay.contact_phone}</p>}
                  {previewStay.booking_url && <p className="text-muted-foreground">{previewStay.booking_url}</p>}
                </div>
              </div>

              <DialogFooter className="gap-2">
                {previewStay.status !== "approved" && (
                  <Button onClick={() => updateStatus.mutate({ id: previewStay.id, status: "approved" })} disabled={updateStatus.isPending}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                {previewStay.status !== "rejected" && (
                  <Button variant="destructive" onClick={() => updateStatus.mutate({ id: previewStay.id, status: "rejected" })} disabled={updateStatus.isPending}>
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
