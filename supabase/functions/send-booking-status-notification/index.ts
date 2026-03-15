import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface StatusNotificationPayload {
  bookingRequestId: string;
  status: "accepted" | "declined";
}

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

    const { bookingRequestId, status }: StatusNotificationPayload = await req.json();
    if (!bookingRequestId || !status) throw new Error("Missing required fields");

    // Fetch booking with stay and guest profile
    const { data: booking, error: bookingError } = await adminClient
      .from("booking_requests")
      .select(`
        *,
        stays:stay_id(name, host_name, contact_email),
        profiles:guest_id(display_name)
      `)
      .eq("id", bookingRequestId)
      .single();

    if (bookingError || !booking) throw new Error("Booking not found");

    // We need the guest's email from auth.users - use admin client
    const { data: authUser } = await adminClient.auth.admin.getUserById(booking.guest_id);
    const guestEmail = authUser?.user?.email;
    if (!guestEmail) throw new Error("Guest email not found");

    const guestName = booking.profiles?.display_name || "Traveler";
    const stayName = booking.stays?.name || "your stay";
    const hostName = booking.stays?.host_name || "The host";

    const isAccepted = status === "accepted";
    const subject = isAccepted
      ? `Great news! Your booking for ${stayName} has been accepted`
      : `Update on your booking request for ${stayName}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #D4A017; font-size: 28px; margin: 0;">Akwantuo</h1>
      <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Booking ${isAccepted ? "Confirmed" : "Update"}</p>
    </div>
    
    <div style="background-color: #faf9f7; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0;">
        Hi ${guestName}! ${isAccepted ? "🎉" : ""}
      </h2>
      ${isAccepted ? `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        ${hostName} has accepted your booking request for <strong>${stayName}</strong>! 
        Please proceed to make your payment to confirm your reservation.
      </p>
      ` : `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Unfortunately, ${hostName} was unable to accommodate your booking request for <strong>${stayName}</strong> at this time.
        Don't worry — there are plenty of amazing stays to explore!
      </p>
      `}
      
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Stay</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${stayName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-in</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${booking.check_in}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-out</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${booking.check_out}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 500; text-align: right; color: ${isAccepted ? "#16a34a" : "#dc2626"};">
              ${isAccepted ? "✅ Accepted" : "❌ Declined"}
            </td>
          </tr>
        </table>
        ${booking.host_response ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Message from Host</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0; font-style: italic;">"${booking.host_response}"</p>
        </div>
        ` : ""}
      </div>
    </div>
    
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://akwantu-roots-connect.lovable.app/my-bookings" style="display: inline-block; background-color: #D4A017; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${isAccepted ? "Pay Now & Confirm" : "Browse More Stays"}
      </a>
    </div>
    
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Akwantuo. Explore West Africa.</p>
    </div>
  </div>
</body>
</html>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Akwantuo <bookings@resend.dev>",
        to: [guestEmail],
        subject,
        html: emailHtml,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Resend error: ${JSON.stringify(data)}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Booking status notification error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
