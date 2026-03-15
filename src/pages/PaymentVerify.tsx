import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, XCircle, Loader2, MapPin, Calendar, Users,
  Mail, Phone, Home, Download, CreditCard, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, differenceInDays } from "date-fns";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function VanillaMap({ lat, lng, name, region, country }: { lat: number; lng: number; name: string; region: string; country: string }) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);

  React.useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([lat, lng], 14);
    mapInstanceRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong><br/>${region}, ${country}`);
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [lat, lng, name, region, country]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}

interface BookingData {
  id: string;
  check_in: string;
  check_out: string;
  guests: number;
  message: string | null;
  stays: {
    id: string;
    name: string;
    region: string;
    country: string;
    image_urls: string[] | null;
    latitude: number | null;
    longitude: number | null;
    contact_email: string | null;
    contact_phone: string | null;
    host_name: string;
    price_per_night: number | null;
  };
}

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    amount: number;
    currency: string;
    reference: string;
  } | null>(null);

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference || !user) return;

    const verify = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("verify-paystack", {
          body: { reference },
        });

        if (fnError) throw fnError;

        if (data.verified) {
          setStatus("success");
          setBooking(data.booking);
          setPaymentInfo({
            amount: data.amount,
            currency: data.currency,
            reference: data.reference,
          });
        } else {
          setStatus("failed");
          setError("Payment was not completed.");
        }
      } catch (err: any) {
        setStatus("failed");
        setError(err.message || "Verification failed");
      }
    };

    verify();
  }, [reference, user]);

  const nights = useMemo(() => {
    if (!booking) return 0;
    return differenceInDays(new Date(booking.check_out), new Date(booking.check_in));
  }, [booking]);

  const pricePerNight = booking?.stays?.price_per_night || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const handleDownloadReceipt = () => {
    if (!booking || !paymentInfo) return;

    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Receipt - ${booking.stays.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; padding: 40px; max-width: 700px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #c8860a; padding-bottom: 24px; }
    .header h1 { font-size: 28px; font-weight: 700; color: #c8860a; }
    .header p { color: #666; margin-top: 4px; font-size: 14px; }
    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-top: 8px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .field p { font-size: 15px; font-weight: 500; margin-top: 2px; }
    .receipt-table { width: 100%; border-collapse: collapse; }
    .receipt-table td { padding: 8px 0; font-size: 14px; }
    .receipt-table .label { color: #666; }
    .receipt-table .value { text-align: right; font-weight: 500; }
    .receipt-table .total td { border-top: 2px solid #1a1a1a; font-weight: 700; font-size: 16px; padding-top: 12px; }
    .receipt-table .total .value { color: #c8860a; }
    .ref { font-size: 12px; color: #888; margin-top: 8px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Akwantuo</h1>
    <p>Booking Confirmation & Receipt</p>
    <span class="badge">✓ Payment Confirmed</span>
  </div>

  <div class="section">
    <h2>Stay Details</h2>
    <div class="grid">
      <div class="field"><label>Property</label><p>${booking.stays.name}</p></div>
      <div class="field"><label>Location</label><p>${booking.stays.region}, ${booking.stays.country}</p></div>
      <div class="field"><label>Host</label><p>${booking.stays.host_name}</p></div>
      ${booking.stays.contact_email ? `<div class="field"><label>Contact</label><p>${booking.stays.contact_email}</p></div>` : ""}
    </div>
  </div>

  <div class="section">
    <h2>Booking Details</h2>
    <div class="grid">
      <div class="field"><label>Check-in</label><p>${format(new Date(booking.check_in), "EEE, MMM d, yyyy")}</p></div>
      <div class="field"><label>Check-out</label><p>${format(new Date(booking.check_out), "EEE, MMM d, yyyy")}</p></div>
      <div class="field"><label>Duration</label><p>${nights} night${nights !== 1 ? "s" : ""}</p></div>
      <div class="field"><label>Guests</label><p>${booking.guests}</p></div>
    </div>
  </div>

  <div class="section">
    <h2>Payment Summary</h2>
    <table class="receipt-table">
      ${pricePerNight > 0 ? `<tr><td class="label">GH₵${pricePerNight.toLocaleString()} × ${nights} night${nights !== 1 ? "s" : ""}</td><td class="value">GH₵${subtotal.toLocaleString()}</td></tr>` : ""}
      <tr><td class="label">Service fee (5%)</td><td class="value">GH₵${serviceFee.toLocaleString()}</td></tr>
      <tr class="total"><td>Total Paid</td><td class="value">GH₵${(paymentInfo.amount / 100).toLocaleString()}</td></tr>
    </table>
    <p class="ref">Reference: ${paymentInfo.reference}</p>
  </div>

  <div class="footer">
    <p>Thank you for booking with Akwantuo. Have a wonderful stay!</p>
    <p style="margin-top: 4px;">Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="font-display text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
          </div>
        )}

        {/* Failed */}
        {status === "failed" && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <h2 className="font-display text-2xl font-bold">Payment Failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-3 mt-6">
              <Button asChild variant="outline">
                <Link to="/stays">Browse Stays</Link>
              </Button>
              <Button asChild>
                <Link to="/my-bookings">My Bookings</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-8">
            {/* Hero confirmation */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-2">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="font-display text-3xl font-bold">Booking Confirmed!</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your stay has been booked and paid for. The host has been notified of your arrival.
              </p>
            </div>

            {/* Booking card */}
            {booking && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                {/* Stay image header */}
                {booking.stays?.image_urls?.[0] && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={booking.stays.image_urls[0]}
                      alt={booking.stays.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h2 className="font-display text-2xl font-bold">{booking.stays.name}</h2>
                      <p className="flex items-center gap-1 text-white/80 text-sm">
                        <MapPin className="h-3 w-3" /> {booking.stays.region}, {booking.stays.country}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Booking details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Check-in
                      </p>
                      <p className="font-semibold">{format(new Date(booking.check_in), "EEE, MMM d")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(booking.check_in), "yyyy")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Check-out
                      </p>
                      <p className="font-semibold">{format(new Date(booking.check_out), "EEE, MMM d")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(booking.check_out), "yyyy")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Duration
                      </p>
                      <p className="font-semibold">{nights} {nights === 1 ? "night" : "nights"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Guests
                      </p>
                      <p className="font-semibold">{booking.guests} {booking.guests === 1 ? "guest" : "guests"}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Receipt */}
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment Receipt
                    </h3>
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                      {pricePerNight > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">GH₵{pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}</span>
                          <span>GH₵{subtotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service fee (5%)</span>
                        <span>GH₵{serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total Paid</span>
                        <span className="text-primary">
                          {paymentInfo ? `GH₵${(paymentInfo.amount / 100).toLocaleString()}` : `GH₵${total.toLocaleString()}`}
                        </span>
                      </div>
                      {paymentInfo?.reference && (
                        <p className="text-xs text-muted-foreground pt-1">
                          Ref: {paymentInfo.reference}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Host contact */}
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" /> Host Details
                    </h3>
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                      <p className="font-medium">{booking.stays.host_name}</p>
                      {booking.stays.contact_email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" /> {booking.stays.contact_email}
                        </p>
                      )}
                      {booking.stays.contact_phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" /> {booking.stays.contact_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Map */}
                  {booking.stays.latitude && booking.stays.longitude && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> Location
                      </h3>
                      <div className="rounded-xl overflow-hidden border border-border h-64">
                        <VanillaMap
                          lat={booking.stays.latitude}
                          lng={booking.stays.longitude}
                          name={booking.stays.name}
                          region={booking.stays.region}
                          country={booking.stays.country}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/my-bookings">View My Bookings</Link>
              </Button>
              {booking && (
                <Button variant="outline" size="lg" onClick={() => handleDownloadReceipt()}>
                  <Download className="h-4 w-4 mr-2" /> Download Receipt
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link to="/stays">Browse More Stays</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
