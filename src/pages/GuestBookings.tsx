import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Check, X, MapPin, Home, Loader2, Ban, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, differenceInHours } from "date-fns";

function PaymentStatus({ bookingRequestId }: { bookingRequestId: string }) {
  const { data: payment } = useQuery({
    queryKey: ["payment", bookingRequestId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("payments")
        .select("*")
        .eq("booking_request_id", bookingRequestId)
        .maybeSingle();
      return data;
    },
  });

  if (!payment) return null;

  if (payment.status === "success") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 border gap-1">
        <Check className="h-3 w-3" /> Paid GH₵{(payment.amount / 100).toLocaleString()}
      </Badge>
    );
  }

  if (payment.status === "refunded") {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 border gap-1">
        Full Refund Processed
      </Badge>
    );
  }

  if (payment.status === "partially_refunded") {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 border gap-1">
        Partial Refund Processed
      </Badge>
    );
  }

  if (payment.status === "pending") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border gap-1">
        <Clock className="h-3 w-3" /> Payment Pending
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <X className="h-3 w-3" /> Payment Failed
    </Badge>
  );
}

function CancellationPolicyInfo({ checkIn }: { checkIn: string }) {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const hoursUntil = differenceInHours(checkInDate, now);
  const isPast = now >= checkInDate;

  if (isPast) return null;

  return (
    <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
      <p className="font-medium flex items-center gap-1 text-foreground">
        <Info className="h-3 w-3" /> Cancellation Policy (Flexible)
      </p>
      <p className={`${hoursUntil >= 24 ? "text-green-700 font-medium" : "text-muted-foreground"}`}>
        • 24+ hours before check-in: <strong>100% refund</strong> {hoursUntil >= 24 && "← You qualify"}
      </p>
      <p className={`${hoursUntil < 24 && !isPast ? "text-yellow-700 font-medium" : "text-muted-foreground"}`}>
        • Less than 24 hours: <strong>50% refund</strong> {hoursUntil < 24 && !isPast && "← You qualify"}
      </p>
      <p className="text-muted-foreground">• After check-in: No cancellation</p>
    </div>
  );
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-3 w-3" />,
    label: "Processing Payment",
  },
  accepted: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <Check className="h-3 w-3" />,
    label: "Confirmed",
  },
  declined: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <X className="h-3 w-3" />,
    label: "Declined",
  },
  cancelled: {
    color: "bg-muted text-muted-foreground border-border",
    icon: <Ban className="h-3 w-3" />,
    label: "Cancelled",
  },
};

export default function GuestBookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["guest-booking-requests", user?.id, tab],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("booking_requests")
        .select(`
          *,
          stays:stay_id(name, region, country, image_urls, host_name)
        `)
        .eq("guest_id", user.id)
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

  const cancelBooking = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase.functions.invoke("cancel-booking", {
        body: { bookingRequestId: id, reason: reason.trim() || null },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Cancelled",
        description: data.message,
      });
      setCancellingId(null);
      setCancelReason("");
      queryClient.invalidateQueries({ queryKey: ["guest-booking-requests"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Legacy delete for unpaid pending bookings
  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("booking_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Request removed", description: "Your booking request has been removed." });
      queryClient.invalidateQueries({ queryKey: ["guest-booking-requests"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
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

  const canCancel = (request: any) => {
    if (request.status !== "accepted") return false;
    const now = new Date();
    const checkIn = new Date(request.check_in);
    return now < checkIn;
  };

  return (
    <div>
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Calendar className="h-3 w-3 mr-1" /> My Trips
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">My Bookings</h1>
            <p className="text-charcoal-foreground/60 mt-1">Track your confirmed stays and payments</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="accepted" className="gap-2"><Check className="h-4 w-4" /> Confirmed</TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-2"><Ban className="h-4 w-4" /> Cancelled</TabsTrigger>
              <TabsTrigger value="pending" className="gap-2"><Clock className="h-4 w-4" /> Pending</TabsTrigger>
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
                  <p className="text-muted-foreground mb-4">
                    {tab === "all" ? "You haven't made any bookings yet" : `No ${tab} bookings`}
                  </p>
                  <Button asChild><Link to="/stays">Browse Stays</Link></Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request: any) => {
                    const nights = differenceInDays(new Date(request.check_out), new Date(request.check_in));
                    const config = statusConfig[request.status] || statusConfig.pending;

                    return (
                      <div key={request.id} className={`bg-card rounded-xl border border-border p-6 ${request.status === "cancelled" ? "opacity-75" : ""}`}>
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Stay image */}
                          <Link to={`/stays/${request.stay_id}`} className="w-full md:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0 group">
                            {request.stays?.image_urls?.[0] ? (
                              <img src={request.stays.image_urls[0]} alt={request.stays.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Home className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </Link>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <Link to={`/stays/${request.stay_id}`} className="font-display text-lg font-semibold hover:text-primary transition-colors">
                                  {request.stays?.name}
                                </Link>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {request.stays?.region}, {request.stays?.country}
                                </p>
                                <p className="text-sm text-muted-foreground">Hosted by {request.stays?.host_name}</p>
                              </div>
                              <Badge className={`${config.color} border text-xs flex-shrink-0 gap-1`}>
                                {config.icon} {config.label}
                              </Badge>
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
                                <p className="font-medium">{nights} {nights === 1 ? "night" : "nights"}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Guests</span>
                                <p className="font-medium">{request.guests} {request.guests === 1 ? "guest" : "guests"}</p>
                              </div>
                            </div>

                            {request.message && (
                              <div className="bg-muted/50 rounded-lg p-3 text-sm mb-3">
                                <p className="text-muted-foreground mb-1">Your message:</p>
                                <p>{request.message}</p>
                              </div>
                            )}

                            {request.host_response && (
                              <div className={`rounded-lg p-3 text-sm mb-3 ${
                                request.status === "accepted" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                              }`}>
                                <p className="text-muted-foreground mb-1">Host response:</p>
                                <p>{request.host_response}</p>
                              </div>
                            )}

                            {/* Cancellation policy for confirmed bookings */}
                            {canCancel(request) && <CancellationPolicyInfo checkIn={request.check_in} />}
                          </div>

                          {/* Actions */}
                          <div className="flex md:flex-col gap-2 flex-shrink-0 items-start">
                            {request.status === "accepted" && (
                              <>
                                <PaymentStatus bookingRequestId={request.id} />
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/stays/${request.stay_id}`}>View Stay</Link>
                                </Button>
                                {canCancel(request) && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive border-destructive/30"
                                        onClick={() => setCancellingId(request.id)}
                                      >
                                        <Ban className="h-3.5 w-3.5 mr-1" /> Cancel Booking
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-destructive" /> Cancel Booking?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                          <div className="space-y-3">
                                            <p>
                                              You're about to cancel your booking at <strong>{request.stays?.name}</strong>.
                                            </p>
                                            <CancellationPolicyInfo checkIn={request.check_in} />
                                            <div>
                                              <Label className="text-sm font-medium">Reason (optional)</Label>
                                              <Textarea
                                                placeholder="Let us know why you're cancelling..."
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                rows={2}
                                                maxLength={300}
                                                className="mt-1"
                                              />
                                            </div>
                                          </div>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => { setCancellingId(null); setCancelReason(""); }}>
                                          Keep Booking
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => cancelBooking.mutate({ id: request.id, reason: cancelReason })}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          disabled={cancelBooking.isPending}
                                        >
                                          {cancelBooking.isPending ? (
                                            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Cancelling...</>
                                          ) : (
                                            "Confirm Cancellation"
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </>
                            )}

                            {request.status === "pending" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <X className="h-4 w-4 mr-1" /> Remove
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove booking request?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove your pending booking request for {request.stays?.name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRequest.mutate(request.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {request.status === "cancelled" && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                <Ban className="h-3 w-3 mr-1" /> No further action
                              </Badge>
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
