import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find users with reminders enabled, incomplete checklists, and not reminded in last 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: checklists, error } = await supabase
      .from("packing_checklists")
      .select("*")
      .eq("reminder_enabled", true)
      .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${threeDaysAgo}`);

    if (error) throw error;

    const totalItems = 35; // Approximate total packing items
    let sent = 0;

    for (const checklist of (checklists || [])) {
      const items = checklist.checked_items as Record<string, boolean> || {};
      const checkedCount = Object.values(items).filter(Boolean).length;
      const progress = Math.round((checkedCount / totalItems) * 100);

      // Only remind if less than 100% complete
      if (progress >= 100) continue;

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(checklist.user_id);
      if (!userData?.user?.email) continue;

      const email = userData.user.email;
      const displayName = userData.user.user_metadata?.full_name || email.split("@")[0];
      const tripDateStr = checklist.trip_date
        ? new Date(checklist.trip_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

      const tripMessage = tripDateStr
        ? `Your trip is coming up on <strong>${tripDateStr}</strong>!`
        : "Don't forget to complete your packing before your trip!";

      const emailHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FFFCF5;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1A1A2E; font-size: 28px; margin: 0;">Akwantuo</h1>
            <p style="color: #8B7355; font-size: 14px; margin: 4px 0 0;">Your Heritage Journey Awaits</p>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #E8DFD0;">
            <h2 style="color: #1A1A2E; font-size: 22px; margin: 0 0 16px;">Hey ${displayName} 👋</h2>
            
            <p style="color: #4A4A4A; line-height: 1.6; margin: 0 0 16px;">${tripMessage}</p>
            
            <div style="background: #F5F0E8; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #8B7355; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Packing Progress</p>
              <div style="background: #E8DFD0; border-radius: 999px; height: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #C9A96E, #8B7355); height: 100%; width: ${progress}%; border-radius: 999px;"></div>
              </div>
              <p style="color: #1A1A2E; font-size: 24px; font-weight: bold; margin: 12px 0 0;">${progress}% complete</p>
              <p style="color: #8B7355; font-size: 14px; margin: 4px 0 0;">${checkedCount} of ~${totalItems} items packed</p>
            </div>
            
            <a href="https://akwantu-roots-connect.lovable.app/travel-essentials#packing" 
               style="display: inline-block; background: #C9A96E; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 16px;">
              Complete Your Packing List →
            </a>
          </div>
          
          <p style="text-align: center; color: #8B7355; font-size: 12px; margin-top: 24px;">
            You're receiving this because you enabled packing reminders on Akwantuo.<br/>
            To stop, uncheck "Email me reminders" on the Travel Essentials page.
          </p>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Akwantuo <onboarding@resend.dev>",
          to: [email],
          subject: tripDateStr
            ? `📦 ${progress}% packed — your trip is ${tripDateStr}!`
            : `📦 Your packing list is ${progress}% complete`,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        await supabase
          .from("packing_checklists")
          .update({ last_reminder_sent_at: new Date().toISOString() })
          .eq("id", checklist.id);
        sent++;
      } else {
        console.error("Resend error:", await res.text());
      }
    }

    return new Response(JSON.stringify({ sent, total: checklists?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("packing-reminder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
