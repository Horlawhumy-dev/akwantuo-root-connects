import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Sparkles, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useArchiveItems } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";

const categories = ["History", "Culture", "Folk Tales", "Literature", "Cuisine", "Traditions", "Hidden Gems"];

const categoryColors: Record<string, string> = {
  History: "bg-kente-maroon/10 text-kente-maroon",
  Culture: "bg-primary/10 text-primary",
  "Folk Tales": "bg-amber-100 text-amber-800",
  Literature: "bg-violet-100 text-violet-800",
  Cuisine: "bg-kente-green/10 text-kente-green",
  Traditions: "bg-secondary/10 text-secondary",
  "Hidden Gems": "bg-accent/10 text-accent",
};

const COUNTRY_ORDER = ["Ghana", "Nigeria", "Benin", "Togo", "Côte d'Ivoire"];

const countrySlugMap: Record<string, string> = {
  Ghana: "ghana",
  Nigeria: "nigeria",
  Benin: "benin",
  Togo: "togo",
  "Côte d'Ivoire": "cote-d-ivoire",
};

const countryFlags: Record<string, string> = {
  Ghana: "🇬🇭",
  Nigeria: "🇳🇬",
  Benin: "🇧🇯",
  Togo: "🇹🇬",
  "Côte d'Ivoire": "🇨🇮",
};

export default function Archive() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const { data: archiveItems, isLoading } = useArchiveItems();

  const filtered = (archiveItems ?? []).filter((item) => {
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.summary.toLowerCase().includes(query.toLowerCase()) ||
      item.region.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    const matchesCountry = !activeCountry || item.country === activeCountry;
    return matchesQuery && matchesCategory && matchesCountry;
  });

  const countries = useMemo(() => {
    const set = new Set((archiveItems ?? []).map(i => i.country));
    return COUNTRY_ORDER.filter(c => set.has(c));
  }, [archiveItems]);

  // Group filtered items by country
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      if (!map.has(item.country)) map.set(item.country, []);
      map.get(item.country)!.push(item);
    }
    // Sort by COUNTRY_ORDER
    return COUNTRY_ORDER
      .filter(c => map.has(c))
      .map(c => ({ country: c, items: map.get(c)! }));
  }, [filtered]);

  return (
    <div>
      <SEOHead title="Sankofa Archive" description="Explore centuries of West African history, culture, cuisine, and traditions curated by local historians." url="https://akwantu-roots-connect.lovable.app/archive" />
      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mb-5">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-foreground mb-4 tracking-tight">
              Sankofa <span className="text-gradient-kente italic">Archive</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-xl mx-auto text-lg">
              A living collection of history, culture, cuisine, traditions and hidden gems from across West Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-5 bg-card/95 backdrop-blur-md border-b border-border sticky top-[67px] z-30">
        <div className="container mx-auto px-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search archive…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  !activeCategory ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeCategory === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Country filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => setActiveCountry(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                !activeCountry ? "bg-charcoal text-charcoal-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Countries
            </button>
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCountry(activeCountry === c ? null : c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeCountry === c ? "bg-charcoal text-charcoal-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {countryFlags[c] || ""} {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grouped by Country */}
      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <LoadingSpinner message="Loading archive..." />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">No items found matching your search.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-8">
                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                {filtered.length} item{filtered.length !== 1 ? "s" : ""} across {grouped.length} countr{grouped.length !== 1 ? "ies" : "y"}
              </p>
              <div className="space-y-12">
                {grouped.map(({ country, items }) => (
                  <div key={country}>
                    <Link to={`/archive/country/${countrySlugMap[country]}`} className="flex items-center gap-3 mb-6 group">
                      <span className="text-2xl">{countryFlags[country] || ""}</span>
                      <h2 className="font-display text-xl font-bold group-hover:text-primary transition-colors">{country}</h2>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
                    </Link>
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
                              <p className="text-xs text-muted-foreground mb-2">{item.region}, {item.country}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
