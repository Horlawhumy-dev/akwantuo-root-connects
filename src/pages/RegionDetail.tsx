import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Sparkles, Eye, Home, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDestination, useRegion, useFestivals, useArchiveItems, useEvents } from "@/hooks/use-supabase-data";
import { useNearbyStays } from "@/hooks/use-nearby-stays";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";

export default function RegionDetail() {
  const { countryId, regionId } = useParams<{ countryId: string; regionId: string }>();
  const { data: dest, isLoading: loadingDest } = useDestination(countryId);
  const { data: region, isLoading: loadingRegion } = useRegion(regionId);
  const { data: allFestivals } = useFestivals();
  const { data: allArchive } = useArchiveItems();
  const { data: allEvents } = useEvents();
  const { data: nearbyStays } = useNearbyStays(region?.name, dest?.country);

  if (loadingDest || loadingRegion) return <LoadingSpinner message="Loading region..." />;

  if (!dest || !region) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Region not found</h2>
          <Button asChild variant="outline"><Link to="/destinations">Back to Destinations</Link></Button>
        </div>
      </div>
    );
  }

  const regionName = region.name.replace(" Region", "");
  const regionFestivals = allFestivals?.filter((f) => f.region === regionName || f.region === region.name) ?? [];
  const regionArchive = allArchive?.filter((a) => a.region === regionName || a.region === region.name) ?? [];
  const regionEvents = allEvents?.filter((e) => (e.region === regionName || e.region === region.name) && e.country === dest.country) ?? [];

  return (
    <div>
      <SEOHead
        title={`${region.name} — ${dest.country}`}
        description={`Explore ${region.name} in ${dest.country}. ${region.description.slice(0, 120)}`}
        image={region.image}
      />
      {/* Hero */}
      <section
        className="relative py-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${region.image})` }}
      >
        <div className="absolute inset-0 bg-charcoal/70" />
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" asChild className="text-charcoal-foreground/60 mb-4 hover:text-charcoal-foreground">
            <Link to={`/destinations/${dest.id}`}><ArrowLeft className="h-4 w-4 mr-1" /> {dest.country}</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-foreground mb-2">{region.name}</h1>
            <div className="flex items-center gap-2 text-charcoal-foreground/60 mb-4">
              <MapPin className="h-4 w-4" /> Capital: {region.capital}
            </div>
            <p className="text-charcoal-foreground/70 max-w-2xl leading-relaxed mb-6">{region.description}</p>
            <Button asChild className="rounded-xl">
              <Link to={`/ai-trip-planner?country=${encodeURIComponent(dest.country)}&region=${encodeURIComponent(region.name)}`}>
                <Sparkles className="h-4 w-4 mr-2" /> Plan a Trip to {regionName}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Highlights & Hidden Gems */}
      <section className="py-16 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Highlights
              </h2>
              <div className="space-y-3">
                {(region.highlights ?? []).map((h: string) => (
                  <div key={h} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Eye className="h-5 w-5 text-kente-maroon" /> Hidden Gems
              </h2>
              <div className="space-y-3">
                {(region.hidden_gems ?? []).map((g: string) => (
                  <div key={g} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <div className="h-2 w-2 rounded-full bg-kente-maroon" />
                    <span className="text-sm font-medium">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Stays */}
      {nearbyStays && nearbyStays.length > 0 && (
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" /> Where to Stay
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">Approved stays in and around {region.name}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyStays.slice(0, 6).map((stay: any, i: number) => (
                <motion.div
                  key={stay.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/stays/${stay.id}`}
                    className="group block rounded-xl overflow-hidden border border-border bg-background hover:shadow-[var(--shadow-kente)] transition-shadow"
                  >
                    <div
                      className="h-36 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${stay.image_urls?.[0] || '/placeholder.svg'})`,
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-sm truncate">{stay.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-[10px]">{stay.type?.replace("_", " ")}</Badge>
                        {stay.price_per_night && (
                          <span className="text-xs font-medium text-primary">
                            ${stay.price_per_night}/night
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{stay.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button asChild variant="outline" className="rounded-xl">
                <Link to={`/stays?country=${dest.country}`}>View all stays in {dest.country}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Region Events */}
      {regionEvents.length > 0 && (
        <section className="py-16 border-t border-border adinkra-bg">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-kente-green" /> Upcoming Events
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">Cultural and community events in {region.name}</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {regionEvents.map((event: any) => (
                <div key={event.id} className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-4">
                    {event.image && (
                      <div
                        className="h-16 w-16 rounded-lg bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${event.image})` }}
                      />
                    )}
                    <div className="min-w-0">
                      <Badge className="mb-2 bg-kente-green/10 text-kente-green border-0 text-[10px]">{event.category}</Badge>
                      <h3 className="font-display font-semibold text-sm">{event.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.date_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {event.date_end && ` — ${new Date(event.date_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Region Festivals */}
      {regionFestivals.length > 0 && (
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Festival Calendar
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {regionFestivals.map((f: any) => (
                <div key={f.id} className="p-5 rounded-xl border border-border bg-background">
                  <Badge className="mb-2 bg-primary/10 text-primary border-0 text-xs">{f.month}</Badge>
                  <h3 className="font-display font-semibold mb-1">{f.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Archive */}
      {regionArchive.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-8">From the Archive</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {regionArchive.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/archive/${item.id}`}
                  className="group p-5 rounded-xl border border-border bg-card hover:shadow-[var(--shadow-kente)] transition-shadow"
                >
                  <Badge variant="outline" className="mb-2 text-xs">{item.category}</Badge>
                  <h3 className="font-display font-semibold group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
