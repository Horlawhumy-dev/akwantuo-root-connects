import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingNotificationPayload {
  hostEmail: string;
  hostName: string;
  guestName: string;
  stayName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const payload: BookingNotificationPayload = await req.json();
    const { hostEmail, hostName, guestName, stayName, checkIn, checkOut, guests, message } = payload;

    // Validate required fields
    if (!hostEmail || !hostName || !guestName || !stayName || !checkIn || !checkOut) {
      throw new Error('Missing required fields');
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #D4A017; font-size: 28px; margin: 0;">Akwantuo</h1>
      <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">New Booking Request</p>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #faf9f7; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0;">
        Hi ${hostName}! 👋
      </h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Great news! You've received a new booking request for <strong>${stayName}</strong>.
      </p>
      
      <!-- Booking Details Card -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
          Booking Details
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guest</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${guestName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-in</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${checkIn}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-out</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${checkOut}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guests</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${guests} ${guests === 1 ? 'guest' : 'guests'}</td>
          </tr>
        </table>
        
        ${message ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Message from Guest</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0; font-style: italic;">"${message}"</p>
        </div>
        ` : ''}
      </div>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://akwantu-roots-connect.lovable.app/host/bookings" style="display: inline-block; background-color: #D4A017; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Booking Request
      </a>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        You're receiving this because you're a host on Akwantuo.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
        © ${new Date().getFullYear()} Akwantuo. Explore West Africa.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Akwantuo <bookings@resend.dev>',
        to: [hostEmail],
        subject: `New Booking Request for ${stayName}`,
        html: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      throw new Error(`Failed to send email: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error sending notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
