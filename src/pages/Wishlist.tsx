import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Home, MapPin, Star, Calendar, Building2, House } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { WishlistButton } from "@/components/ui/WishlistButton";

const typeLabels: Record<string, string> = {
  guesthouse: "Guest House",
  boutique_hotel: "Boutique Hotel",
  homestay: "Homestay",
};

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();

  const stayIds = wishlistItems.filter((w: any) => w.item_type === "stay").map((w: any) => w.item_id);
  const destIds = wishlistItems.filter((w: any) => w.item_type === "destination").map((w: any) => w.item_id);

  const { data: savedStays = [] } = useQuery({
    queryKey: ["wishlist-stays", stayIds],
    queryFn: async () => {
      if (stayIds.length === 0) return [];
      const { data, error } = await supabase.from("stays").select("*").in("id", stayIds);
      if (error) throw error;
      return data || [];
    },
    enabled: stayIds.length > 0,
  });

  const { data: savedDests = [] } = useQuery({
    queryKey: ["wishlist-dests", destIds],
    queryFn: async () => {
      if (destIds.length === 0) return [];
      const { data, error } = await supabase.from("destinations").select("*").in("id", destIds);
      if (error) throw error;
      return data || [];
    },
    enabled: destIds.length > 0,
  });

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) { navigate("/login"); return null; }

  const isEmpty = savedStays.length === 0 && savedDests.length === 0;

  return (
    <div>
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Heart className="h-3 w-3 mr-1" /> Wishlist
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">Saved Places</h1>
            <p className="text-charcoal-foreground/60 mt-1">Your curated collection of stays and destinations</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4">
          {isEmpty ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">Nothing Saved Yet</h2>
              <p className="text-muted-foreground">Browse stays and destinations to start saving your favorites.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {savedStays.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold mb-4">Saved Stays ({savedStays.length})</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedStays.map((stay: any) => (
                      <div key={stay.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow relative group">
                        <WishlistButton itemType="stay" itemId={stay.id} className="absolute top-3 right-3 z-10" />
                        <Link to={`/stays/${stay.id}`}>
                          <div className="h-40 overflow-hidden">
                            {stay.image_urls?.[0] ? (
                              <img src={stay.image_urls[0]} alt={stay.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center"><Home className="h-8 w-8 text-muted-foreground" /></div>
                            )}
                          </div>
                          <div className="p-4">
                            <Badge variant="secondary" className="text-[10px] mb-2">{typeLabels[stay.type] || stay.type}</Badge>
                            <h3 className="font-display font-semibold text-sm mb-1">{stay.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {stay.region}, {stay.country}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {savedDests.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold mb-4">Saved Destinations ({savedDests.length})</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedDests.map((dest: any) => (
                      <div key={dest.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow relative group">
                        <WishlistButton itemType="destination" itemId={dest.id} className="absolute top-3 right-3 z-10" />
                        <Link to={`/destinations/${dest.id}`}>
                          <div className="h-40 bg-cover bg-center group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url(${dest.image})` }} />
                          <div className="p-4">
                            <h3 className="font-display font-semibold text-sm mb-1">{dest.country}</h3>
                            <p className="text-xs text-muted-foreground">{dest.tagline}</p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
