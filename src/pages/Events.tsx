import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, MapPin, Music, Palette, Utensils, Shirt, Mountain, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useEvents } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import { format, isSameMonth, parseISO } from "date-fns";

const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  cultural: { icon: <Users className="h-3.5 w-3.5" />, color: "text-primary" },
  music: { icon: <Music className="h-3.5 w-3.5" />, color: "text-kente-green" },
  art: { icon: <Palette className="h-3.5 w-3.5" />, color: "text-purple-500" },
  food: { icon: <Utensils className="h-3.5 w-3.5" />, color: "text-orange-500" },
  fashion: { icon: <Shirt className="h-3.5 w-3.5" />, color: "text-pink-500" },
  adventure: { icon: <Mountain className="h-3.5 w-3.5" />, color: "text-blue-500" },
};

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 2, 1)); // March 2026
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    let list = events ?? [];
    list = list.filter(e => isSameMonth(parseISO(e.date_start), selectedMonth));
    if (activeCategory) list = list.filter(e => e.category === activeCategory);
    return list.sort((a, b) => a.date_start.localeCompare(b.date_start));
  }, [events, selectedMonth, activeCategory]);

  const eventDates = useMemo(() => {
    return (events ?? []).map(e => parseISO(e.date_start));
  }, [events]);

  const categories = useMemo(() => {
    const cats = [...new Set((events ?? []).map(e => e.category))];
    return cats.sort();
  }, [events]);

  if (isLoading) return <LoadingSpinner message="Loading events..." />;

  return (
    <div>
      <SEOHead title="Cultural Events in West Africa" description="Browse upcoming cultural events, music festivals, art exhibitions, and food fairs across West Africa." url="https://akwantu-roots-connect.lovable.app/events" />
      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mb-5">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-foreground mb-4 tracking-tight">
              Events <span className="text-gradient-kente italic">Calendar</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-xl mx-auto text-lg">
              Discover upcoming festivals, concerts, art shows, and cultural events across Ghana.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar with calendar + filters */}
            <div>
              <div className="rounded-xl border border-border bg-card p-4 mb-6">
                <Calendar
                  mode="single"
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  modifiers={{ event: eventDates }}
                  modifiersClassNames={{ event: "bg-primary/20 text-primary font-bold" }}
                  className="pointer-events-auto"
                />
              </div>

              <div>
                <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">Filter by Category</h3>
                <div className="space-y-1.5">
                  {categories.map(cat => {
                    const cfg = categoryConfig[cat] || { icon: <Users className="h-3.5 w-3.5" />, color: "text-primary" };
                    const count = (events ?? []).filter(e => e.category === cat && isSameMonth(parseISO(e.date_start), selectedMonth)).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-sm ${
                          activeCategory === cat ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <span className={`flex items-center gap-2 ${cfg.color} font-medium capitalize`}>
                          {cfg.icon} {cat}
                        </span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Event cards */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-lg font-semibold mb-4">
                {format(selectedMonth, "MMMM yyyy")} — {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
              </h2>

              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No events this month. Try another month or category.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => {
                    const cfg = categoryConfig[event.category] || categoryConfig.cultural;
                    return (
                      <Link to={`/events/${event.id}`} key={event.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {event.image && (
                            <div className="sm:w-48 h-40 sm:h-auto shrink-0">
                              <img
                                src={event.image}
                                alt={event.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="p-5 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className={`${cfg.color} text-[10px] capitalize gap-1`}>
                                {cfg.icon} {event.category}
                              </Badge>
                              {event.recurring && (
                                <Badge variant="outline" className="text-[10px]">Annual</Badge>
                              )}
                            </div>
                            <h3 className="font-display font-semibold text-base mb-1">{event.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {format(parseISO(event.date_start), "MMM d")}
                                {event.date_end && event.date_end !== event.date_start && ` – ${format(parseISO(event.date_end), "MMM d")}`}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {event.venue || event.region}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                      </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
