import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function useWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isWishlisted = (itemType: string, itemId: string) =>
    wishlistItems.some((w: any) => w.item_type === itemType && w.item_id === itemId);

  const toggleWishlist = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      if (!user) throw new Error("Must be logged in");
      const existing = wishlistItems.find(
        (w: any) => w.item_type === itemType && w.item_id === itemId
      );
      if (existing) {
        const { error } = await supabase.from("wishlists").delete().eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
        });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
      toast({
        title: result.action === "added" ? "Saved!" : "Removed",
        description: result.action === "added" ? "Added to your wishlist" : "Removed from wishlist",
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return { wishlistItems, isWishlisted, toggleWishlist };
}
