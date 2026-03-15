import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, MapPin, Calendar, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFestivals } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Festivals() {
  const { data: festivals, isLoading } = useFestivals();
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const allRegions = [...new Set((festivals ?? []).map(f => f.region))].sort();

  const filtered = (festivals ?? []).filter(f => {
    if (query && !f.name.toLowerCase().includes(query.toLowerCase()) && !f.description.toLowerCase().includes(query.toLowerCase())) return false;
    if (monthFilter !== "all" && f.month !== monthFilter) return false;
    if (regionFilter !== "all" && f.region !== regionFilter) return false;
    return true;
  });

  return (
    <div>
      <SEOHead title="West African Festivals" description="Discover vibrant festivals across West Africa — from Homowo to Aboakyir. Plan your visit around these cultural celebrations." url="https://akwantu-roots-connect.lovable.app/festivals" />
      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mb-5">
              <Music className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-foreground mb-4 tracking-tight">
              Festivals & <span className="text-gradient-kente italic">Celebrations</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-xl mx-auto text-lg">
              Experience the vibrant rhythm of West African culture through its most spectacular festivals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-5 bg-card/95 backdrop-blur-md border-b border-border sticky top-[67px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search festivals..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 rounded-xl" />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-xl"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {allRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Festival grid */}
      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <LoadingSpinner message="Loading festivals..." />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
                <Music className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">No festivals found. Try different filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                {filtered.length} festival{filtered.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((fest, i) => (
                  <Link to={`/festivals/${fest.id}`} key={fest.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl overflow-hidden border border-border bg-card card-hover group"
                  >
                    <div className="h-52 overflow-hidden relative">
                      <img
                        src={fest.image}
                        alt={fest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <Badge className="bg-card/90 text-foreground border-0 text-xs backdrop-blur-sm">
                          <Calendar className="h-3 w-3 mr-1" /> {fest.month}
                        </Badge>
                        <Badge className="bg-card/90 text-foreground border-0 text-xs backdrop-blur-sm">
                          <MapPin className="h-3 w-3 mr-1" /> {fest.region}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{fest.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{fest.description}</p>
                      {fest.highlights && fest.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {fest.highlights.slice(0, 3).map((h: string) => (
                            <Badge key={h} variant="secondary" className="text-[10px] rounded-full">{h}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
