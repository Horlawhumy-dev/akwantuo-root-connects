import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { stayId, hostId, checkIn, checkOut, guests, message, callbackUrl, stayName, hostEmail, hostName } = body;

    // Support both legacy (bookingRequestId) and new instant-pay flow
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    let bookingRequestId: string;
    let stayData: any;

    if (body.bookingRequestId) {
      // Legacy: existing booking request (host-accepted flow)
      bookingRequestId = body.bookingRequestId;
      const { data: booking, error: bookingError } = await adminClient
        .from("booking_requests")
        .select("*, stays:stay_id(name, price_per_night)")
        .eq("id", bookingRequestId)
        .single();
      if (bookingError || !booking) throw new Error("Booking not found");
      if (booking.guest_id !== user.id) throw new Error("Not your booking");
      stayData = booking.stays;
    } else {
      // New instant-pay: create booking request + payment in one go
      if (!stayId || !checkIn || !checkOut) throw new Error("Missing booking details");

      // Fetch stay info
      const { data: stay, error: stayError } = await adminClient
        .from("stays")
        .select("name, price_per_night, host_id")
        .eq("id", stayId)
        .single();
      if (stayError || !stay) throw new Error("Stay not found");
      stayData = stay;

      // Create booking request with status 'accepted' (instant pay = auto-confirmed)
      const { data: newBooking, error: insertError } = await adminClient
        .from("booking_requests")
        .insert({
          stay_id: stayId,
          guest_id: user.id,
          host_id: hostId || stay.host_id,
          check_in: checkIn,
          check_out: checkOut,
          guests: guests || 1,
          message: message || null,
          status: "accepted",
        })
        .select("id")
        .single();

      if (insertError) throw new Error(`Failed to create booking: ${insertError.message}`);
      bookingRequestId = newBooking.id;
    }

    // Calculate amount
    const checkInDate = new Date(body.checkIn || (await adminClient.from("booking_requests").select("check_in, check_out").eq("id", bookingRequestId).single()).data?.check_in);
    const checkOutDate = new Date(body.checkOut || (await adminClient.from("booking_requests").select("check_in, check_out").eq("id", bookingRequestId).single()).data?.check_out);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = stayData?.price_per_night || 5000;
    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + serviceFee;
    const amountInKobo = totalAmount * 100;

    const reference = `akwantu_${bookingRequestId}_${Date.now()}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        currency: "GHS",
        reference,
        callback_url: callbackUrl || `${req.headers.get("origin")}/payment/verify`,
        metadata: {
          booking_request_id: bookingRequestId,
          guest_id: user.id,
          stay_name: stayData?.name || stayName,
          nights,
          service_fee: serviceFee,
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) {
      throw new Error(`Paystack error: ${JSON.stringify(paystackData)}`);
    }

    // Create payment record
    const { error: paymentError } = await adminClient.from("payments").insert({
      booking_request_id: bookingRequestId,
      guest_id: user.id,
      amount: amountInKobo,
      currency: "GHS",
      provider: "paystack",
      provider_reference: reference,
      provider_access_code: paystackData.data.access_code,
      status: "pending",
    });
    if (paymentError) throw paymentError;

    // Send notification to host about new confirmed booking (fire and forget)
    if (hostEmail || stayName) {
      try {
        const { data: guestProfile } = await adminClient
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        await fetch(`${supabaseUrl}/functions/v1/send-booking-notification`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostEmail,
            hostName: hostName || "Host",
            guestName: guestProfile?.display_name || user.email,
            stayName: stayData?.name || stayName,
            checkIn: body.checkIn || checkInDate.toISOString().split("T")[0],
            checkOut: body.checkOut || checkOutDate.toISOString().split("T")[0],
            guests: guests || 1,
            message: message || undefined,
          }),
        }).catch(console.error);
      } catch (e) {
        console.error("Notification error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference,
        booking_request_id: bookingRequestId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Initialize Paystack error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
