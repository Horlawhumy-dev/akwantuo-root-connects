import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Store, MapPin, Truck, Package, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const deliveryLabels: Record<string, string> = {
  pickup: "Pickup Only",
  delivery: "Delivery Only",
  both: "Pickup & Delivery",
};

const deliveryIcons: Record<string, React.ReactNode> = {
  pickup: <Package className="h-3.5 w-3.5" />,
  delivery: <Truck className="h-3.5 w-3.5" />,
  both: <Truck className="h-3.5 w-3.5" />,
};

const categoryOptions = [
  "General", "Food & Drink", "Fashion & Textiles", "Arts & Crafts",
  "Beauty & Wellness", "Tours & Experiences", "Electronics", "Home & Living",
];

export default function Marketplace() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*, shop_products(count), shop_reviews(rating)")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((s: any) => {
        const ratings = (s.shop_reviews || []).map((r: any) => r.rating);
        return {
          ...s,
          avg_rating: ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0,
          review_count: ratings.length,
        };
      });
    },
  });

  const filtered = useMemo(() => {
    return shops.filter((s: any) => {
      if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.description.toLowerCase().includes(query.toLowerCase())) return false;
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      if (deliveryFilter !== "all" && s.delivery_style !== deliveryFilter) return false;
      if (countryFilter !== "all" && s.country !== countryFilter) return false;
      return true;
    });
  }, [shops, query, categoryFilter, deliveryFilter, countryFilter]);

  return (
    <div>
      <SEOHead
        title="Marketplace — Local Shops & Services"
        description="Discover authentic local shops, artisans, and service providers across West Africa. Support local businesses on your journey."
      />

      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Store className="h-3 w-3 mr-1" /> Marketplace
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal-foreground mb-3">
              Local Shops & Services
            </h1>
            <p className="text-charcoal-foreground/60 max-w-xl">
              Support local businesses — from handcrafted goods to authentic dining and cultural experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-10 adinkra-bg">
        <div className="container mx-auto px-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shops..."
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((c) => (
                  <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Delivery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delivery</SelectItem>
                <SelectItem value="pickup">Pickup Only</SelectItem>
                <SelectItem value="delivery">Delivery Only</SelectItem>
                <SelectItem value="both">Pickup & Delivery</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {["Ghana", "Senegal", "Nigeria", "Côte d'Ivoire", "Mali"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user && (
              <Button asChild>
                <Link to="/marketplace/submit"><Plus className="h-4 w-4 mr-2" /> List Your Shop</Link>
              </Button>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading shops..." />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">No Shops Found</h2>
              <p className="text-muted-foreground mb-4">
                {shops.length === 0 ? "Be the first to list your business!" : "Try adjusting your filters."}
              </p>
              {user && (
                <Button asChild>
                  <Link to="/marketplace/submit"><Plus className="h-4 w-4 mr-2" /> List Your Shop</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((shop: any) => (
                <motion.div key={shop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Link
                    to={`/marketplace/${shop.id}`}
                    className="group block rounded-2xl overflow-hidden border border-border bg-card card-hover"
                  >
                    <div className="h-48 overflow-hidden bg-muted">
                      {shop.image_urls?.[0] ? (
                        <img
                          src={shop.image_urls[0]}
                          alt={shop.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Store className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px]">{shop.category}</Badge>
                        <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                          {deliveryIcons[shop.delivery_style]}
                          {deliveryLabels[shop.delivery_style]}
                        </Badge>
                      </div>
                      <h3 className="font-display font-semibold group-hover:text-primary transition-colors mb-1">
                        {shop.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{shop.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{shop.region}, {shop.country}</span>
                        {shop.avg_rating > 0 && (
                          <span className="flex items-center gap-0.5 ml-auto">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            {shop.avg_rating.toFixed(1)} ({shop.review_count})
                          </span>
                        )}
                        <span className={shop.avg_rating > 0 ? "" : "ml-auto"}>{shop.shop_products?.[0]?.count ?? 0} products</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
