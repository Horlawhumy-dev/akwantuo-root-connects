import { useParams, Link } from "react-router-dom";
import { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useArchiveItems } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const countryMeta: Record<string, { flag: string; intro: string; center: [number, number]; zoom: number }> = {
  ghana: {
    flag: "🇬🇭",
    intro: "Ghana, the 'Gateway to West Africa,' is a land steeped in centuries of history — from the powerful Ashanti Empire to the haunting slave castles along the coast. Its vibrant culture, warm hospitality, and rich traditions make it a cornerstone of the African diaspora's heritage journey.",
    center: [7.95, -1.03],
    zoom: 7,
  },
  nigeria: {
    flag: "🇳🇬",
    intro: "Nigeria, Africa's most populous nation, is a cultural powerhouse with over 250 ethnic groups. From the ancient Benin Kingdom's bronzes to the rhythms of Afrobeats, Nigeria's stories span millennia of innovation, resilience, and creative brilliance.",
    center: [9.08, 8.68],
    zoom: 6,
  },
  benin: {
    flag: "🇧🇯",
    intro: "The Republic of Benin, cradle of Vodun and home of the legendary Dahomey Kingdom, holds some of West Africa's most powerful spiritual and warrior traditions. Its Fon, Yoruba, and Adja peoples have shaped cultures that resonate across the Atlantic.",
    center: [9.31, 2.31],
    zoom: 7,
  },
  togo: {
    flag: "🇹🇬",
    intro: "Togo, a slender nation between Ghana and Benin, is home to the Ewe and Batammariba peoples whose traditions — from sacred fortresses to ancient storytelling — remain vibrantly alive. Its diverse landscapes mirror its rich cultural tapestry.",
    center: [8.62, 1.21],
    zoom: 7,
  },
  "cote-d-ivoire": {
    flag: "🇨🇮",
    intro: "Côte d'Ivoire, the land of the Baoulé, Senufo, and Dyula peoples, blends forest kingdoms with savanna empires. From the legendary Queen Pokou to the ancient trading city of Kong, its history is one of migration, resilience, and cultural richness.",
    center: [7.54, -5.55],
    zoom: 7,
  },
};

// Map slug to actual country name in DB
const slugToCountry: Record<string, string> = {
  ghana: "Ghana",
  nigeria: "Nigeria",
  benin: "Benin",
  togo: "Togo",
  "cote-d-ivoire": "Côte d'Ivoire",
};

const categoryColors: Record<string, string> = {
  History: "bg-kente-maroon/10 text-kente-maroon",
  Culture: "bg-primary/10 text-primary",
  "Folk Tales": "bg-amber-100 text-amber-800",
  Literature: "bg-violet-100 text-violet-800",
  Cuisine: "bg-kente-green/10 text-kente-green",
  Traditions: "bg-secondary/10 text-secondary",
  "Hidden Gems": "bg-accent/10 text-accent",
};

export default function ArchiveCountryDetail() {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const { data: archiveItems, isLoading } = useArchiveItems();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const meta = countrySlug ? countryMeta[countrySlug] : undefined;
  const countryName = countrySlug ? slugToCountry[countrySlug] : undefined;

  const items = useMemo(
    () => (archiveItems ?? []).filter((i) => i.country === countryName),
    [archiveItems, countryName]
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !meta || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: meta.center,
      zoom: meta.zoom,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    L.control.attribution({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [meta]);

  if (isLoading) return <LoadingSpinner message="Loading stories..." />;

  if (!meta || !countryName) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Country not found</h2>
          <Button asChild variant="outline"><Link to="/archive">Back to Archive</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={`${countryName} Stories — Sankofa Archive`}
        description={meta.intro.slice(0, 155)}
        url={`https://akwantu-roots-connect.lovable.app/archive/country/${countrySlug}`}
      />

      {/* Hero */}
      <section className="relative py-24 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" asChild className="text-charcoal-foreground/60 mb-4 hover:text-charcoal-foreground">
            <Link to="/archive"><ArrowLeft className="h-4 w-4 mr-1" /> Archive</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-5xl mb-4 block">{meta.flag}</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-foreground mb-3 tracking-tight">
              {countryName}
            </h1>
            <p className="text-charcoal-foreground/60 max-w-2xl text-lg leading-relaxed">
              {meta.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map */}
      <section className="py-10 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div ref={mapRef} className="h-64 sm:h-80 rounded-xl overflow-hidden border border-border" />
        </div>
      </section>

      {/* Stories */}
      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-bold">
              {items.length} Stor{items.length !== 1 ? "ies" : "y"} from {countryName}
            </h2>
          </div>

          {items.length === 0 ? (
            <p className="text-muted-foreground">No stories yet for this country.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/archive/${item.id}`}
                    className="group block rounded-2xl overflow-hidden border border-border bg-card card-hover"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <div
                        className="h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
                    </div>
                    <div className="p-5">
                      <Badge className={`mb-2 border-0 text-xs rounded-full ${categoryColors[item.category] || ""}`}>
                        {item.category}
                      </Badge>
                      <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 inline mr-1" />{item.region}, {item.country}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
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
