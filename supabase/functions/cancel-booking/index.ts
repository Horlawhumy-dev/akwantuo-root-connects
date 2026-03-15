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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { bookingRequestId, reason } = await req.json();
    if (!bookingRequestId) throw new Error("bookingRequestId is required");

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking
    const { data: booking, error: bookingError } = await adminClient
      .from("booking_requests")
      .select("*, stays:stay_id(name, price_per_night)")
      .eq("id", bookingRequestId)
      .single();

    if (bookingError || !booking) throw new Error("Booking not found");
    if (booking.guest_id !== user.id) throw new Error("Not your booking");
    if (booking.status === "cancelled") throw new Error("Booking already cancelled");
    if (booking.status === "declined") throw new Error("Booking was declined");

    // Check if already checked in (past check-in date)
    const now = new Date();
    const checkInDate = new Date(booking.check_in);

    // Flexible cancellation policy:
    // - 24+ hours before check-in: 100% refund
    // - Less than 24 hours: 50% refund
    // - After check-in date: no cancellation allowed
    if (now >= checkInDate) {
      throw new Error("Cannot cancel after check-in date");
    }

    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    let refundPercentage = 100;
    if (hoursUntilCheckIn < 24) {
      refundPercentage = 50;
    }

    // Get payment info
    const { data: payment } = await adminClient
      .from("payments")
      .select("amount, status")
      .eq("booking_request_id", bookingRequestId)
      .eq("status", "success")
      .maybeSingle();

    const originalAmount = payment?.amount || 0;
    const refundAmount = Math.round(originalAmount * (refundPercentage / 100));

    // Update booking status to cancelled
    const { error: updateError } = await adminClient
      .from("booking_requests")
      .update({ status: "cancelled" })
      .eq("id", bookingRequestId);

    if (updateError) throw new Error(`Failed to cancel booking: ${updateError.message}`);

    // Create cancellation record
    const { error: cancelError } = await adminClient
      .from("cancellations")
      .insert({
        booking_request_id: bookingRequestId,
        guest_id: user.id,
        reason: reason || null,
        refund_percentage: refundPercentage,
        refund_amount: refundAmount,
        original_amount: originalAmount,
      });

    if (cancelError) {
      console.error("Failed to create cancellation record:", cancelError);
    }

    // Update payment status to refunded if applicable
    if (payment && refundAmount > 0) {
      await adminClient
        .from("payments")
        .update({ status: refundPercentage === 100 ? "refunded" : "partially_refunded" })
        .eq("booking_request_id", bookingRequestId)
        .eq("status", "success");
    }

    // Send cancellation notification to host (fire and forget)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        const { data: guestProfile } = await adminClient
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        const { data: hostAuth } = await adminClient.auth.admin.getUserById(booking.host_id);
        const hostEmail = hostAuth?.user?.email;

        if (hostEmail) {
          const guestName = guestProfile?.display_name || user.email;
          const stayName = booking.stays?.name || "your stay";

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Akwantuo <bookings@resend.dev>",
              to: [hostEmail],
              subject: `Booking Cancelled — ${stayName}`,
              html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#D4A017;font-size:28px;margin:0;">Akwantuo</h1>
      <p style="color:#6b7280;font-size:14px;margin-top:4px;">Booking Cancellation</p>
    </div>
    <div style="background:#faf9f7;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#1f2937;font-size:20px;margin:0 0 16px;">Booking Cancelled</h2>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        <strong>${guestName}</strong> has cancelled their booking for <strong>${stayName}</strong>.
      </p>
      <div style="background:#fff;border-radius:8px;padding:20px;border:1px solid #e5e7eb;margin-top:16px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-in</td><td style="text-align:right;color:#1f2937;font-weight:500;">${booking.check_in}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-out</td><td style="text-align:right;color:#1f2937;font-weight:500;">${booking.check_out}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Refund</td><td style="text-align:right;color:#1f2937;font-weight:600;">${refundPercentage}%${refundAmount > 0 ? ` (GH₵${(refundAmount / 100).toLocaleString()})` : ""}</td></tr>
          ${reason ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Reason</td><td style="text-align:right;color:#4b5563;font-style:italic;">${reason}</td></tr>` : ""}
        </table>
      </div>
    </div>
    <div style="text-align:center;padding-top:24px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Akwantuo. Explore West Africa.</p>
    </div>
  </div>
</body>
</html>`,
            }),
          });
        }
      } catch (e) {
        console.error("Notification error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        refund_percentage: refundPercentage,
        refund_amount: refundAmount,
        original_amount: originalAmount,
        message: refundPercentage === 100
          ? "Booking cancelled. Full refund will be processed."
          : `Booking cancelled. ${refundPercentage}% refund (GH₵${(refundAmount / 100).toLocaleString()}) will be processed.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cancel booking error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
