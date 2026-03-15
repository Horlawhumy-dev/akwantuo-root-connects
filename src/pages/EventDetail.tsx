import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Users, Music, Palette, Utensils, Shirt, Mountain, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { format, parseISO } from "date-fns";

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  cultural: { icon: <Users className="h-4 w-4" />, color: "text-primary", label: "Cultural" },
  music: { icon: <Music className="h-4 w-4" />, color: "text-kente-green", label: "Music" },
  art: { icon: <Palette className="h-4 w-4" />, color: "text-purple-500", label: "Art" },
  food: { icon: <Utensils className="h-4 w-4" />, color: "text-orange-500", label: "Food" },
  fashion: { icon: <Shirt className="h-4 w-4" />, color: "text-pink-500", label: "Fashion" },
  adventure: { icon: <Mountain className="h-4 w-4" />, color: "text-blue-500", label: "Adventure" },
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner message="Loading event..." />;

  if (!event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Event not found</p>
        <Button asChild variant="outline"><Link to="/events">Back to Events</Link></Button>
      </div>
    );
  }

  const cfg = categoryConfig[event.category] || categoryConfig.cultural;
  const dateStr = format(parseISO(event.date_start), "MMMM d, yyyy");
  const endStr = event.date_end && event.date_end !== event.date_start
    ? ` – ${format(parseISO(event.date_end), "MMMM d, yyyy")}`
    : "";

  return (
    <div>
      <SEOHead
        title={event.name}
        description={`${event.name} — ${dateStr} in ${event.venue || event.region}, ${event.country}. ${event.description.slice(0, 120)}`}
        image={event.image || undefined}
      />

      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark overflow-hidden">
        {event.image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${event.image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" className="text-charcoal-foreground/60 mb-4" asChild>
            <Link to="/events"><ArrowLeft className="h-4 w-4 mr-1" /> Events</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${cfg.color} bg-card/90 border-0 capitalize gap-1`}>
                {cfg.icon} {cfg.label}
              </Badge>
              {event.recurring && (
                <Badge variant="outline" className="text-charcoal-foreground/60 border-charcoal-foreground/20">
                  <Clock className="h-3 w-3 mr-1" /> Annual
                </Badge>
              )}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-foreground mb-3">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-charcoal-foreground/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {dateStr}{endStr}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {event.venue || event.region}, {event.country}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 adinkra-bg">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-72 object-cover rounded-2xl"
                />
              )}
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-display font-semibold">Event Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{dateStr}{endStr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.venue || event.region}, {event.country}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${cfg.color}`}>
                    {cfg.icon}
                    <span className="capitalize">{event.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
