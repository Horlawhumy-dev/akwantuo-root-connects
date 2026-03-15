import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from = "USD" } = await req.json().catch(() => ({}));
    const base = from.toUpperCase();

    // Use the free exchangerate.host API (no key required)
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!res.ok) {
      throw new Error(`Exchange rate API returned ${res.status}`);
    }

    const data = await res.json();
    if (data.result !== "success") {
      throw new Error("Exchange rate API error");
    }

    const ghsRate = data.rates?.GHS;
    if (!ghsRate) {
      throw new Error("GHS rate not found in response");
    }

    return new Response(
      JSON.stringify({
        base,
        target: "GHS",
        rate: ghsRate,
        updated: data.time_last_update_utc || new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Exchange rate error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
