import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { interests, duration, budget, country, travelers, region } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Akwantuo's AI Trip Planner — an expert on West African travel, especially Ghana, Nigeria, Togo, Benin, and Côte d'Ivoire. You create detailed, culturally rich day-by-day itineraries for travelers of the African diaspora reconnecting with their heritage.

When generating an itinerary:
- Create a day-by-day plan with morning, afternoon, and evening activities
- Include specific place names, local restaurants, markets, and cultural sites
- Add practical tips (what to wear, local customs, bargaining advice)
- Suggest local foods to try each day
- Include estimated costs in local currency (GHS for Ghana, NGN for Nigeria, XOF for Togo/Benin/Côte d'Ivoire)
- Mention transport between locations
- Add cultural context and historical significance of places
- Include hidden gems and off-the-beaten-path experiences
- Format with clear markdown headers (## Day 1, ### Morning, etc.)
- End with a "Pro Tips" section

Be warm, enthusiastic, and culturally sensitive. Remember this is often a deeply personal journey of reconnection.`;

    const regionNote = region ? `\n**Region focus:** ${region} — prioritize activities, restaurants, and cultural sites in and around this region.` : "";
    const userPrompt = `Plan a ${duration}-day trip to ${country || "Ghana"} for ${travelers || 1} traveler(s).

**Interests:** ${interests || "Culture, History, Food"}
**Budget:** ${budget || "Mid-range"}
**Special focus:** Heritage reconnection, local experiences, authentic cultural immersion${regionNote}

Please create a detailed day-by-day itinerary with specific recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-trip-planner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
