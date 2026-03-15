import { useState, useMemo } from "react";
import { CalendarIcon, Users, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isBefore, isAfter, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BookingRequestFormProps {
  stayId: string;
  hostId: string;
  stayName: string;
  pricePerNight: number;
  hostEmail?: string;
  hostName?: string;
}

export function BookingRequestForm({ stayId, hostId, stayName, pricePerNight, hostEmail, hostName }: BookingRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState("2");
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  // Check if user already has an active booking for this stay
  const { data: existingBooking } = useQuery({
    queryKey: ["booking-request", stayId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("booking_requests")
        .select("id, status, check_in, check_out, guests")
        .eq("stay_id", stayId)
        .eq("guest_id", user.id)
        .in("status", ["pending", "accepted"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(checkOut, checkIn);
  }, [checkIn, checkOut]);

  const totalPrice = nights * pricePerNight;
  const serviceFee = Math.round(totalPrice * 0.05); // 5% service fee
  const grandTotal = totalPrice + serviceFee;

  const handleBookAndPay = async () => {
    if (!user || !checkIn || !checkOut) return;
    setPaying(true);

    try {
      // Create booking request + initialize payment in one edge function call
      const callbackUrl = `${window.location.origin}/payment/verify`;
      const { data, error } = await supabase.functions.invoke("initialize-paystack", {
        body: {
          stayId,
          hostId,
          checkIn: format(checkIn, "yyyy-MM-dd"),
          checkOut: format(checkOut, "yyyy-MM-dd"),
          guests: parseInt(guests),
          message: message.trim() || null,
          callbackUrl,
          stayName,
          hostEmail,
          hostName,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setPaying(false);
    }
  };

  // Host viewing own listing
  if (user?.id === hostId) {
    return (
      <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
        <h3 className="font-display text-lg font-semibold mb-2">Your Listing</h3>
        <p className="text-sm text-muted-foreground">
          This is your stay listing. View bookings in your{" "}
          <Link to="/host/bookings" className="text-primary hover:underline">Host Dashboard</Link>.
        </p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display text-lg font-semibold mb-3">Book This Stay</h3>
        <p className="text-sm text-muted-foreground mb-4">Sign in to book this stay instantly.</p>
        <Button asChild className="w-full"><Link to="/login">Sign In to Book</Link></Button>
      </div>
    );
  }

  // Existing active booking
  if (existingBooking) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display text-lg font-semibold mb-3">Booking Active</h3>
        <p className="text-sm text-muted-foreground mb-2">You have an active booking for this stay.</p>
        <div className="text-sm space-y-1 bg-muted/50 p-3 rounded-lg">
          <p><span className="font-medium">Check-in:</span> {existingBooking.check_in}</p>
          <p><span className="font-medium">Check-out:</span> {existingBooking.check_out}</p>
          <p><span className="font-medium">Guests:</span> {existingBooking.guests}</p>
        </div>
        <Button asChild variant="outline" className="w-full mt-3" size="sm">
          <Link to="/my-bookings">View My Bookings</Link>
        </Button>
      </div>
    );
  }

  const today = new Date();
  const isValidDates = checkIn && checkOut && isAfter(checkOut, checkIn);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Book & Pay</h3>
        {pricePerNight > 0 && (
          <p className="text-sm">
            <span className="font-display text-xl font-bold text-primary">GH₵{pricePerNight.toLocaleString()}</span>
            <span className="text-muted-foreground">/night</span>
          </p>
        )}
      </div>

      <div className="space-y-4">
        {/* Check-in */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  setCheckIn(date);
                  if (date && (!checkOut || isBefore(checkOut, date))) {
                    setCheckOut(addDays(date, 1));
                  }
                }}
                disabled={(date) => isBefore(date, today)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => !checkIn || isBefore(date, addDays(checkIn, 1))}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Guests</Label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "guest" : "guests"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Message to Host (optional)</Label>
          <Textarea
            placeholder="Introduce yourself..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            maxLength={500}
          />
        </div>

        {/* Price breakdown */}
        {isValidDates && pricePerNight > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GH₵{pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}</span>
               <span>GH₵{totalPrice.toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Service fee (5%)</span>
               <span>GH₵{serviceFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">GH₵{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleBookAndPay}
          disabled={!isValidDates || paying || pricePerNight <= 0}
        >
          {paying ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting to payment...</>
          ) : (
            <><CreditCard className="h-4 w-4 mr-2" /> Book & Pay GH₵{isValidDates ? grandTotal.toLocaleString() : "—"}</>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Secure payment via Paystack. The host will be notified of your confirmed booking.
        </p>
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-0.5">
          <p className="font-medium text-foreground">Flexible Cancellation Policy</p>
          <p>• 24+ hours before check-in: Full refund</p>
          <p>• Less than 24 hours: 50% refund</p>
        </div>
      </div>
    </div>
  );
}
