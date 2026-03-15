import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Phone, Mail, Truck, Package, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ShopReviews } from "@/components/shops/ShopReviews";

const deliveryLabels: Record<string, string> = {
  pickup: "Pickup Only",
  delivery: "Delivery Only",
  both: "Pickup & Delivery",
};

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: shop, isLoading } = useQuery({
    queryKey: ["shop", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["shop-products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("shop_id", id!)
        .order("created_at");
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner message="Loading shop..." />;

  if (!shop) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Shop not found</p>
        <Button asChild variant="outline"><Link to="/marketplace">Back to Marketplace</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={shop.name}
        description={`${shop.category} in ${shop.region}, ${shop.country}. ${shop.description.slice(0, 140)}`}
        image={shop.image_urls?.[0]}
      />

      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        {shop.image_urls?.[0] && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${shop.image_urls[0]})` }}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" className="text-charcoal-foreground/60 mb-4" asChild>
            <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" /> Marketplace</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/20 text-primary border-primary/30">{shop.category}</Badge>
              <Badge variant="outline" className="text-charcoal-foreground/60 border-charcoal-foreground/20">
                {deliveryLabels[shop.delivery_style as string]}
              </Badge>
            </div>
            <h1 className="font-display text-4xl font-bold text-charcoal-foreground mb-2">{shop.name}</h1>
            <div className="flex items-center gap-2 text-charcoal-foreground/60">
              <MapPin className="h-4 w-4" />
              <span>{shop.address || `${shop.region}, ${shop.country}`}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 adinkra-bg">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Images */}
              {shop.image_urls && shop.image_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {shop.image_urls.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${shop.name} image ${i + 1}`}
                      className={`rounded-xl object-cover w-full ${i === 0 ? "col-span-2 h-64" : "h-40"}`}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{shop.description}</p>
              </div>

              {/* Products */}
              <div>
                <h2 className="font-display text-xl font-semibold mb-4">
                  Products & Services ({products.length})
                </h2>
                {products.length === 0 ? (
                  <p className="text-muted-foreground">No products listed yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {products.map((product: any) => (
                      <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-36 w-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            {product.is_service && (
                              <Badge variant="secondary" className="text-[10px]">Service</Badge>
                            )}
                            <h3 className="font-medium text-sm">{product.name}</h3>
                          </div>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                          )}
                          <p className="font-display font-semibold text-primary">
                            {product.currency} {Number(product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
               )}
              </div>

              {/* Reviews */}
              <ShopReviews shopId={shop.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-display font-semibold">Contact</h3>
                {shop.phone && (
                  <a href={`tel:${shop.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Phone className="h-4 w-4" /> {shop.phone}
                  </a>
                )}
                {shop.email && (
                  <a href={`mailto:${shop.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Mail className="h-4 w-4" /> {shop.email}
                  </a>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {shop.delivery_style === "pickup" ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                  {deliveryLabels[shop.delivery_style as string]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
