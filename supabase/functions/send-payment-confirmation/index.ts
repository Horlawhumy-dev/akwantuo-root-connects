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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingRequestId, amount, currency } = await req.json();
    if (!bookingRequestId) throw new Error("bookingRequestId is required");

    const { data: booking, error: bookingError } = await adminClient
      .from("booking_requests")
      .select(`
        *,
        stays:stay_id(name, region, country, host_name, contact_email, contact_phone, price_per_night),
        profiles:guest_id(display_name)
      `)
      .eq("id", bookingRequestId)
      .single();

    if (bookingError || !booking) throw new Error("Booking not found");

    const { data: authUser } = await adminClient.auth.admin.getUserById(booking.guest_id);
    const guestEmail = authUser?.user?.email;
    if (!guestEmail) throw new Error("Guest email not found");

    const { data: hostAuth } = await adminClient.auth.admin.getUserById(booking.host_id);
    const hostEmail = hostAuth?.user?.email || booking.stays?.contact_email;

    const guestName = booking.profiles?.display_name || "Traveler";
    const stayName = booking.stays?.name || "your stay";
    const hostName = booking.stays?.host_name || "Host";
    const hostContactEmail = booking.stays?.contact_email;
    const hostContactPhone = booking.stays?.contact_phone;
    const amountFormatted = `GH₵${((amount || 0) / 100).toLocaleString()}`;

    // Calculate nights & pricing
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = booking.stays?.price_per_night || 0;
    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * 0.05);

    const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    // Host contact section for guest email
    const hostContactRows = [
      `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Host</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${hostName}</td></tr>`,
      hostContactEmail ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;"><a href="mailto:${hostContactEmail}" style="color: #D4A017; text-decoration: none;">${hostContactEmail}</a></td></tr>` : "",
      hostContactPhone ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;"><a href="tel:${hostContactPhone}" style="color: #D4A017; text-decoration: none;">${hostContactPhone}</a></td></tr>` : "",
    ].filter(Boolean).join("");

    const guestEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #D4A017; font-size: 28px; margin: 0;">Akwantuo</h1>
      <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Booking Confirmation</p>
    </div>

    <div style="background-color: #faf9f7; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0;">Booking Confirmed! 🎉</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${guestName}, your payment for <strong>${stayName}</strong> has been confirmed. Here are your booking details:
      </p>

      <!-- Stay & Check-in Details -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 16px;">
        <h3 style="color: #1f2937; font-size: 15px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Stay Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Property</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${stayName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${booking.stays?.region}, ${booking.stays?.country}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-in</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(checkIn)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-out</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(checkOut)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${nights} night${nights !== 1 ? "s" : ""}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guests</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${booking.guests}</td></tr>
        </table>
      </div>

      <!-- Payment Breakdown -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 16px;">
        <h3 style="color: #1f2937; font-size: 15px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${pricePerNight > 0 ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">GH₵${pricePerNight.toLocaleString()} × ${nights} night${nights !== 1 ? "s" : ""}</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">GH₵${subtotal.toLocaleString()}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service fee (5%)</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">GH₵${serviceFee.toLocaleString()}</td></tr>
          <tr style="border-top: 2px solid #e5e7eb;"><td style="padding: 12px 0 8px; color: #1f2937; font-size: 16px; font-weight: 700;">Total Paid</td><td style="padding: 12px 0 8px; color: #16a34a; font-size: 16px; font-weight: 700; text-align: right;">${amountFormatted}</td></tr>
        </table>
      </div>

      <!-- Host Contact Info -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
        <h3 style="color: #1f2937; font-size: 15px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Host</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${hostContactRows}
        </table>
        <p style="color: #6b7280; font-size: 13px; margin: 12px 0 0; line-height: 1.5;">Feel free to reach out to your host with any questions about your stay or arrival details.</p>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://akwantu-roots-connect.lovable.app/my-bookings" style="display: inline-block; background-color: #D4A017; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View My Bookings</a>
    </div>
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Akwantuo. Explore West Africa with intention.</p>
    </div>
  </div>
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Akwantuo <bookings@resend.dev>",
        to: [guestEmail],
        subject: `Booking Confirmed — ${stayName} (${formatDate(checkIn)} – ${formatDate(checkOut)})`,
        html: guestEmailHtml,
      }),
    });

    // Notify host
    if (hostEmail) {
      const hostEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #D4A017; font-size: 28px; margin: 0;">Akwantuo</h1>
      <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Payment Received</p>
    </div>
    <div style="background-color: #faf9f7; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0;">Payment Received! 💰</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${hostName}, <strong>${guestName}</strong> has completed payment of <strong>${amountFormatted}</strong> for <strong>${stayName}</strong>. The booking is confirmed.
      </p>
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guest</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${guestName} (${guestEmail})</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-in</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(checkIn)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-out</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(checkOut)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guests</td><td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${booking.guests}</td></tr>
          <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 12px 0 8px; color: #1f2937; font-size: 16px; font-weight: 600;">Amount</td><td style="padding: 12px 0 8px; color: #16a34a; font-size: 16px; font-weight: 600; text-align: right;">${amountFormatted}</td></tr>
        </table>
      </div>
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://akwantu-roots-connect.lovable.app/host/bookings" style="display: inline-block; background-color: #D4A017; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Bookings</a>
    </div>
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Akwantuo. Explore West Africa with intention.</p>
    </div>
  </div>
</body>
</html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Akwantuo <bookings@resend.dev>",
          to: [hostEmail],
          subject: `Payment Received — ${guestName} for ${stayName}`,
          html: hostEmailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment confirmation error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
