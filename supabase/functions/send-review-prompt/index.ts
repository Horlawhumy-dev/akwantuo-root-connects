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

    const { bookingRequestId } = await req.json();
    if (!bookingRequestId) throw new Error("bookingRequestId is required");

    const { data: booking, error: bookingError } = await adminClient
      .from("booking_requests")
      .select(`
        *,
        stays:stay_id(id, name, region, country, image_urls),
        profiles:guest_id(display_name)
      `)
      .eq("id", bookingRequestId)
      .single();

    if (bookingError || !booking) throw new Error("Booking not found");

    const { data: authUser } = await adminClient.auth.admin.getUserById(booking.guest_id);
    const guestEmail = authUser?.user?.email;
    if (!guestEmail) throw new Error("Guest email not found");

    const guestName = booking.profiles?.display_name || "Traveler";
    const stayName = booking.stays?.name || "your stay";
    const stayId = booking.stays?.id || "";
    const stayImage = booking.stays?.image_urls?.[0] || "";
    const region = booking.stays?.region || "";
    const country = booking.stays?.country || "";

    const reviewUrl = `https://akwantu-roots-connect.lovable.app/stays/${stayId}#reviews`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #D4A017; font-size: 28px; margin: 0;">Akwantuo</h1>
      <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">How Was Your Stay?</p>
    </div>

    ${stayImage ? `
    <div style="border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <img src="${stayImage}" alt="${stayName}" style="width: 100%; height: 200px; object-fit: cover;" />
    </div>
    ` : ""}

    <div style="background-color: #faf9f7; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0;">
        Hi ${guestName}! 🌍
      </h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        We hope you had an amazing time at <strong>${stayName}</strong> in ${region}, ${country}!
      </p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Your feedback helps fellow travelers find great stays and helps hosts improve their offerings. Would you take a moment to share your experience?
      </p>

      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Rate Your Stay</p>
        <p style="font-size: 32px; margin: 0 0 8px 0;">⭐⭐⭐⭐⭐</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Click below to leave your review</p>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${reviewUrl}" style="display: inline-block; background-color: #D4A017; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Write a Review
      </a>
    </div>

    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Thank you for traveling with Akwantuo.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">© ${new Date().getFullYear()} Akwantuo. Explore West Africa with intention.</p>
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
        subject: `How was your stay at ${stayName}? ⭐`,
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
    console.error("Review prompt error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
