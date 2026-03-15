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

    const { reference } = await req.json();
    if (!reference) throw new Error("reference is required");

    // Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok) {
      throw new Error(`Paystack verification failed: ${JSON.stringify(paystackData)}`);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const txStatus = paystackData.data?.status;
    const isSuccess = txStatus === "success";

    // Update payment record
    const { data: paymentData, error: updateError } = await adminClient
      .from("payments")
      .update({
        status: isSuccess ? "success" : "failed",
        paid_at: isSuccess ? new Date().toISOString() : null,
      })
      .eq("provider_reference", reference)
      .eq("guest_id", user.id)
      .select("booking_request_id, amount, currency")
      .single();

    if (updateError) throw updateError;

    // Fetch full booking details for the confirmation page
    let bookingDetails = null;
    if (isSuccess && paymentData) {
      const { data: booking } = await adminClient
        .from("booking_requests")
        .select(`
          id, check_in, check_out, guests, message,
          stays:stay_id(id, name, region, country, image_urls, latitude, longitude, contact_email, contact_phone, host_name, price_per_night)
        `)
        .eq("id", paymentData.booking_request_id)
        .single();

      bookingDetails = booking;

      // Send payment confirmation email (fire and forget)
      fetch(`${supabaseUrl}/functions/v1/send-payment-confirmation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingRequestId: paymentData.booking_request_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
        }),
      }).catch((err) => console.error("Failed to send payment confirmation:", err));

      // Schedule review prompt email for after checkout (fire and forget)
      // We send it immediately but the email itself says "How was your stay?"
      // In production, this would be scheduled for after check_out date
      const checkOutDate = bookingDetails?.check_out ? new Date(bookingDetails.check_out) : null;
      const now = new Date();
      if (checkOutDate && checkOutDate <= now) {
        // Already past checkout, send review prompt now
        fetch(`${supabaseUrl}/functions/v1/send-review-prompt`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingRequestId: paymentData.booking_request_id }),
        }).catch((err) => console.error("Failed to send review prompt:", err));
      }
    }

    return new Response(
      JSON.stringify({
        verified: isSuccess,
        status: txStatus,
        amount: paystackData.data?.amount,
        currency: paystackData.data?.currency,
        reference,
        booking: bookingDetails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Verify Paystack error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
