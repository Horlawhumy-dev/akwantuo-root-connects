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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Find bookings where:
    // 1. Status is 'accepted' (confirmed)
    // 2. Payment was successful
    // 3. Checkout was yesterday (1 day ago)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: bookings, error: bookingsError } = await adminClient
      .from("booking_requests")
      .select("id, guest_id, check_out")
      .eq("status", "accepted")
      .eq("check_out", yesterdayStr);

    if (bookingsError) throw bookingsError;

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No bookings to prompt", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to only bookings with successful payments
    const bookingIds = bookings.map((b) => b.id);
    const { data: paidBookings, error: paymentsError } = await adminClient
      .from("payments")
      .select("booking_request_id")
      .in("booking_request_id", bookingIds)
      .eq("status", "success");

    if (paymentsError) throw paymentsError;

    const paidBookingIds = new Set(
      (paidBookings || []).map((p) => p.booking_request_id)
    );

    // Check which guests already left a review for their stay
    const eligibleBookings = bookings.filter((b) =>
      paidBookingIds.has(b.id)
    );

    let sent = 0;
    const errors: string[] = [];

    for (const booking of eligibleBookings) {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/send-review-prompt`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookingRequestId: booking.id }),
          }
        );

        if (res.ok) {
          sent++;
        } else {
          const err = await res.text();
          errors.push(`Booking ${booking.id}: ${err}`);
        }
      } catch (e) {
        errors.push(
          `Booking ${booking.id}: ${e instanceof Error ? e.message : "Unknown"}`
        );
      }
    }

    console.log(
      `Review prompts: ${sent} sent, ${errors.length} failed out of ${eligibleBookings.length} eligible`
    );

    return new Response(
      JSON.stringify({
        eligible: eligibleBookings.length,
        sent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cron review prompts error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
