import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNearbyStays(regionName: string | undefined, country: string | undefined) {
  return useQuery({
    queryKey: ["nearby-stays", regionName, country],
    queryFn: async () => {
      // Try exact region match first, then fall back to country
      const regionClean = regionName?.replace(" Region", "") ?? "";
      const { data, error } = await supabase
        .from("stays")
        .select("*")
        .eq("status", "approved")
        .eq("country", country!)
        .or(`region.eq.${regionClean},region.eq.${regionName}`)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      // If no region-specific stays, get country-wide
      if (!data || data.length === 0) {
        const { data: countryData, error: countryError } = await supabase
          .from("stays")
          .select("*")
          .eq("status", "approved")
          .eq("country", country!)
          .order("created_at", { ascending: false })
          .limit(6);
        if (countryError) throw countryError;
        return countryData;
      }

      return data;
    },
    enabled: !!regionName && !!country,
  });
}
