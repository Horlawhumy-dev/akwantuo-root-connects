import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("tier");
      if (error) throw error;
      return data;
    },
  });
}

export function useDestination(id: string | undefined) {
  return useQuery({
    queryKey: ["destinations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useRegions(destinationId: string | undefined) {
  return useQuery({
    queryKey: ["regions", destinationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .eq("destination_id", destinationId!)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!destinationId,
  });
}

export function useRegion(regionId: string | undefined) {
  return useQuery({
    queryKey: ["region", regionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .eq("id", regionId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!regionId,
  });
}

export function useArchiveItems() {
  return useQuery({
    queryKey: ["archive_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("archive_items")
        .select("*")
        .order("title");
      if (error) throw error;
      return data;
    },
  });
}

export function useArchiveItem(id: string | undefined) {
  return useQuery({
    queryKey: ["archive_items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("archive_items")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useFestivals() {
  return useQuery({
    queryKey: ["festivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useSafetyZones() {
  return useQuery({
    queryKey: ["safety_zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_zones")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useHospitals() {
  return useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useTransportHubs() {
  return useQuery({
    queryKey: ["transport_hubs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_hubs")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date_start");
      if (error) throw error;
      return data;
    },
  });
}
