import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePageVisibility() {
  return useQuery({
    queryKey: ["page-visibility"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_visibility")
        .select("page_slug, enabled");
      if (error) throw error;
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((row: any) => {
        map[row.page_slug] = row.enabled;
      });
      return map;
    },
    staleTime: 60_000,
  });
}

export function useIsPageEnabled(slug: string) {
  const { data, isLoading } = usePageVisibility();
  return { enabled: data?.[slug] ?? true, isLoading };
}
