import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Shield, Hospital, Bus, Star, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDestination, useRegions, useSafetyZones, useHospitals, useTransportHubs, useFestivals } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";

export default function CountryDetail() {
  const { countryId } = useParams<{ countryId: string }>();
  const { data: dest, isLoading: loadingDest } = useDestination(countryId);
  const { data: regions, isLoading: loadingRegions } = useRegions(countryId);
  const { data: allSafety } = useSafetyZones();
  const { data: allHospitals } = useHospitals();
  const { data: allTransport } = useTransportHubs();
  const { data: allFestivals } = useFestivals();

  if (loadingDest || loadingRegions) return <LoadingSpinner message="Loading country..." />;

  if (!dest) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Country not found</h2>
          <Button asChild variant="outline"><Link to="/destinations">Back to Destinations</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={`${dest.country} — Explore Destinations`}
        description={`${dest.tagline}. ${dest.description.slice(0, 120)}`}
        image={dest.image}
      />
      {/* Hero */}
      <section
        className="relative py-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${dest.image})` }}
      >
        <div className="absolute inset-0 bg-charcoal/75" />
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" asChild className="text-charcoal-foreground/60 mb-4 hover:text-charcoal-foreground">
            <Link to="/destinations"><ArrowLeft className="h-4 w-4 mr-1" /> Destinations</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-5xl font-bold text-charcoal-foreground mb-2">{dest.country}</h1>
            <p className="text-primary text-xl font-medium mb-4">{dest.tagline}</p>
            <p className="text-charcoal-foreground/70 max-w-2xl leading-relaxed">{dest.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Regions grid */}
      {regions && regions.length > 0 && (
        <section className="py-16 adinkra-bg">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold mb-2">All {regions.length} Regions</h2>
            <p className="text-muted-foreground mb-10">Explore every corner of {dest.country}</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regions.map((region, i) => (
                <motion.div
                  key={region.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/destinations/${dest.id}/${region.id}`}
                    className="group block rounded-xl overflow-hidden border border-border bg-card hover:shadow-[var(--shadow-kente)] transition-shadow"
                  >
                    <div
                      className="h-36 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${region.image})` }}
                    />
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-sm">{region.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {region.capital}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{region.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Country Travel Guide */}
      {(() => {
        const countrySafety = allSafety?.filter(s => s.country === dest.country) ?? [];
        const countryHospitals = allHospitals?.filter(h => h.country === dest.country) ?? [];
        const countryTransport = allTransport?.filter(t => t.country === dest.country) ?? [];
        const countryFestivals = allFestivals?.filter(f => f.country === dest.country) ?? [];
        const hasGuideData = countrySafety.length > 0 || countryHospitals.length > 0 || countryTransport.length > 0 || countryFestivals.length > 0;

        if (!hasGuideData) return null;

        const levelColor: Record<string, string> = {
          safe: "bg-kente-green/10 text-kente-green border-0",
          caution: "bg-yellow-500/10 text-yellow-600 border-0",
          avoid: "bg-destructive/10 text-destructive border-0",
        };

        const navItems = [
          ...(countrySafety.length > 0 ? [{ id: "safety", label: "Safety Zones", icon: "🛡️" }] : []),
          ...(countryHospitals.length > 0 ? [{ id: "hospitals", label: "Hospitals", icon: "🏥" }] : []),
          ...(countryTransport.length > 0 ? [{ id: "transport", label: "Transport", icon: "🚌" }] : []),
          ...(countryFestivals.length > 0 ? [{ id: "festivals", label: "Festivals", icon: "⭐" }] : []),
        ];

        return (
          <section className="py-16 bg-card border-t border-border">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl font-bold mb-2">Country Travel Guide</h2>
              <p className="text-muted-foreground mb-6">Essential info for travelling in {dest.country}</p>

              {/* Quick-nav anchors */}
              <div className="flex flex-wrap gap-2 mb-10">
                {navItems.map(item => (
                  <a
                    key={item.id}
                    href={`#guide-${item.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <span>{item.icon}</span> {item.label}
                  </a>
                ))}
              </div>

              {/* Safety Zones */}
              {countrySafety.length > 0 && (
                <div id="guide-safety" className="mb-12 scroll-mt-24">
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-kente-green" /> Safety Zones
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countrySafety.map(s => (
                      <div key={s.id} className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-display font-semibold text-sm">{s.name}</h4>
                          <Badge className={levelColor[s.level] || ""}>{s.level}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.region}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospitals */}
              {countryHospitals.length > 0 && (
                <div id="guide-hospitals" className="mb-12 scroll-mt-24">
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Hospital className="h-5 w-5 text-destructive" /> Hospitals & Clinics
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countryHospitals.map(h => (
                      <div key={h.id} className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-display font-semibold text-sm truncate">{h.name}</h4>
                          {h.emergency && (
                            <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] shrink-0">
                              <AlertTriangle className="h-3 w-3 mr-1" /> 24/7
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] mb-2">{h.type}</Badge>
                        <p className="text-xs text-muted-foreground">{h.region}</p>
                        {h.phone && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {h.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport */}
              {countryTransport.length > 0 && (
                <div id="guide-transport" className="mb-12 scroll-mt-24">
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" /> Transport Hubs
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countryTransport.map(t => (
                      <div key={t.id} className="p-4 rounded-xl border border-border bg-background">
                        <h4 className="font-display font-semibold text-sm">{t.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{t.type.replace("_", " ")}</Badge>
                          <span className="text-xs text-muted-foreground">{t.region}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Festivals */}
              {countryFestivals.length > 0 && (
                <div id="guide-festivals" className="scroll-mt-24">
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" /> Festival Calendar
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countryFestivals.map(f => (
                      <div key={f.id} className="p-4 rounded-xl border border-border bg-background">
                        <Badge className="mb-2 bg-primary/10 text-primary border-0 text-xs">{f.month}</Badge>
                        <h4 className="font-display font-semibold text-sm">{f.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{f.region}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* Tier 2 landmarks */}
      {dest.landmarks && dest.landmarks.length > 0 && (
        <section className="py-16 adinkra-bg">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold mb-8">Key Landmarks</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {dest.landmarks.map((l) => (
                <div key={l} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-medium text-sm">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
