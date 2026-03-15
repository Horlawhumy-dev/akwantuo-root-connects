import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Check, X, User, MessageSquare, MapPin, Home, CreditCard, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";

function HostPaymentStatus({ bookingRequestId }: { bookingRequestId: string }) {
  const { data: payment } = useQuery({
    queryKey: ["host-payment-status", bookingRequestId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("payments")
        .select("status, amount, paid_at")
        .eq("booking_request_id", bookingRequestId)
        .maybeSingle();
      return data;
    },
  });

  if (!payment) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border text-xs gap-1">
        <Clock className="h-3 w-3" /> Awaiting Payment
      </Badge>
    );
  }

  if (payment.status === "success") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 border text-xs gap-1">
        <CreditCard className="h-3 w-3" /> Paid GH₵{(payment.amount / 100).toLocaleString()}
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border text-xs gap-1">
      <Clock className="h-3 w-3" /> Payment {payment.status}
    </Badge>
  );
}

export default function HostBookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("accepted");

  const { data: hostStays = [] } = useQuery({
    queryKey: ["host-stays", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("stays")
        .select("id, name")
        .eq("host_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["host-booking-requests", user?.id, tab],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("booking_requests")
        .select(`
          *,
          stays:stay_id(name, region, country, image_urls, price_per_night)
        `)
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (tab !== "all") {
        query = query.eq("status", tab as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (authLoading) {
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

  if (hostStays.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4 px-4">
        <Home className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-xl font-semibold text-center">No Stays Listed</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have any stays listed yet. Once you list a stay, confirmed bookings from guests will appear here.
        </p>
        <Button asChild>
          <Link to="/stays/submit">List Your Stay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Calendar className="h-3 w-3 mr-1" /> Host Dashboard
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">
              Bookings
            </h1>
            <p className="text-charcoal-foreground/60 mt-1">
              View confirmed bookings and payments from guests
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="accepted" className="gap-2">
                <Check className="h-4 w-4" /> Confirmed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-2">
                <Ban className="h-4 w-4" /> Cancelled
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                All
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
              ) : requests.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {tab === "accepted" ? "No confirmed bookings yet" : "No bookings"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When guests book and pay for your stays, they'll appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request: any) => {
                    const nights = differenceInDays(new Date(request.check_out), new Date(request.check_in));
                    const pricePerNight = request.stays?.price_per_night || 0;
                    const total = pricePerNight * nights;

                    return (
                      <div key={request.id} className="bg-card rounded-xl border border-border p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Stay image */}
                          <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            {request.stays?.image_urls?.[0] ? (
                              <img src={request.stays.image_urls[0]} alt={request.stays.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Home className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-display text-lg font-semibold">{request.stays?.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {request.stays?.region}, {request.stays?.country}
                                </p>
                              </div>
                              <HostPaymentStatus bookingRequestId={request.id} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Check-in</span>
                                <p className="font-medium">{format(new Date(request.check_in), "MMM d, yyyy")}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Check-out</span>
                                <p className="font-medium">{format(new Date(request.check_out), "MMM d, yyyy")}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration</span>
                                <p className="font-medium">{nights} {nights === 1 ? "night" : "nights"}, {request.guests} {request.guests === 1 ? "guest" : "guests"}</p>
                              </div>
                              {total > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Stay Total</span>
                                  <p className="font-medium">GH₵{total.toLocaleString()}</p>
                                </div>
                              )}
                            </div>

                            {request.message && (
                              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                <p className="text-muted-foreground flex items-center gap-1 mb-1">
                                  <MessageSquare className="h-3 w-3" /> Guest message
                                </p>
                                <p>{request.message}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
