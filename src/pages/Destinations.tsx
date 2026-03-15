import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Globe, Crown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDestinations, useRegions } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import { AfricaMap } from "@/components/destinations/AfricaMap";

function FeaturedCard({ dest }: { dest: any }) {
  const { data: regions } = useRegions(dest.id);
  return (
    <Link
      to={`/destinations/${dest.id}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-card card-hover"
    >
      <div className="grid md:grid-cols-2">
        <div className="h-64 md:h-80 overflow-hidden">
          <div
            className="h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url(${dest.image})` }}
          />
        </div>
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <Badge className="w-fit mb-4 bg-primary/10 text-primary border-0 gap-1">
            <Crown className="h-3 w-3" /> Full Coverage
          </Badge>
          <h3 className="font-display text-3xl lg:text-4xl font-bold mb-2 tracking-tight">{dest.country}</h3>
          <p className="text-primary font-medium mb-3 italic">{dest.tagline}</p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
            {dest.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
            {regions && regions.length > 0 && (
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{regions.length} regions</span>
            )}
            {dest.landmarks && dest.landmarks.length > 0 && (
              <span>{dest.landmarks.length} landmarks</span>
            )}
          </div>
          <Button className="w-fit group-hover:gap-3 transition-all rounded-xl">
            Explore {dest.country} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

function CountryCard({ dest, index }: { dest: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      <Link
        to={`/destinations/${dest.id}`}
        className="group block rounded-2xl overflow-hidden border border-border bg-card card-hover h-full"
      >
        <div className="h-48 overflow-hidden">
          <div
            className="h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url(${dest.image})` }}
          />
        </div>
        <div className="p-5">
          <Badge className="mb-2 bg-primary/10 text-primary border-0 text-[10px] gap-1">
            <Crown className="h-2.5 w-2.5" /> Explore
          </Badge>
          <h3 className="font-display text-xl font-bold mb-1">{dest.country}</h3>
          <p className="text-xs text-primary mb-2 italic">{dest.tagline}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{dest.description}</p>
          {dest.landmarks && dest.landmarks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dest.landmarks.slice(0, 3).map((l: string) => (
                <span key={l} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function Destinations() {
  const { data: destinations, isLoading } = useDestinations();

  if (isLoading) return <LoadingSpinner message="Loading destinations..." />;

  // Ghana is the featured/primary destination
  const featured = destinations?.find((d) => d.id === "ghana");
  const tier1Others = destinations?.filter((d) => d.tier === 1 && d.id !== "ghana") ?? [];
  const tier2 = destinations?.filter((d) => d.tier === 2) ?? [];

  return (
    <div>
      <SEOHead
        title="Explore African Destinations"
        description="Discover Ghana, Nigeria, Senegal, and more — explore every region with curated guides, stays, and cultural highlights."
        url="https://akwantu-roots-connect.lovable.app/destinations"
      />
      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mb-5">
              <Globe className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-foreground mb-4 tracking-tight">
              Explore <span className="text-gradient-kente italic">Destinations</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-xl mx-auto text-lg">
              From Ghana's golden heartland to the vibrant cultures across the African continent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured — Ghana */}
      {featured && (
        <section className="py-16 lg:py-20 adinkra-bg">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Badge className="mb-3 bg-primary/10 text-primary border-0 text-xs">Featured</Badge>
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-2 tracking-tight">Featured Destination</h2>
              <p className="text-muted-foreground">Deep-dive into every region</p>
            </div>
            <FeaturedCard dest={featured} />
          </div>
        </section>
      )}

      {/* Interactive Africa Map */}
      {destinations && destinations.length > 0 && (
        <AfricaMap destinations={destinations} />
      )}

      {/* Tier 1 — Other fully covered countries */}
      {tier1Others.length > 0 && (
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Badge className="mb-3 bg-primary/10 text-primary border-0 text-xs">West Africa</Badge>
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-2 tracking-tight">Explore West Africa</h2>
              <p className="text-muted-foreground">Rich cultures, historic landmarks, and unforgettable experiences</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tier1Others.map((dest, i) => (
                <CountryCard key={dest.id} dest={dest} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tier 2 — Coming Soon */}
      {tier2.length > 0 && (
        <section className="py-16 border-t border-border adinkra-bg">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Badge className="mb-3 bg-accent/10 text-accent border-0 text-xs gap-1">
                <Clock className="h-3 w-3" /> Coming Soon
              </Badge>
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-2 tracking-tight">Expanding Across Africa</h2>
              <p className="text-muted-foreground">More destinations launching soon — from the Sahel to the Indian Ocean</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {tier2.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border overflow-hidden bg-background group relative"
                >
                  <div className="h-44 overflow-hidden">
                    <div
                      className="h-full w-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${dest.image})` }}
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-charcoal/80 text-charcoal-foreground border-0 text-[10px] gap-1">
                      <Clock className="h-2.5 w-2.5" /> Coming Soon
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold">{dest.country}</h3>
                    <p className="text-xs text-primary mb-2 italic">{dest.tagline}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{dest.description}</p>
                    {dest.landmarks && dest.landmarks.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {dest.landmarks.slice(0, 2).map((l: string) => (
                          <span key={l} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
