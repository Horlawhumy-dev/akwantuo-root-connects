import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Sparkles, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function FestivalDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: festival, isLoading } = useQuery({
    queryKey: ["festival", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner message="Loading festival..." />;

  if (!festival) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Festival not found</p>
        <Button asChild variant="outline"><Link to="/festivals">Back to Festivals</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={festival.name}
        description={`${festival.name} — ${festival.month} in ${festival.region}, ${festival.country}. ${festival.description.slice(0, 120)}`}
        image={festival.image}
      />

      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${festival.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" className="text-charcoal-foreground/60 mb-4" asChild>
            <Link to="/festivals"><ArrowLeft className="h-4 w-4 mr-1" /> Festivals</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Calendar className="h-3 w-3 mr-1" /> {festival.month}
              </Badge>
              <Badge variant="outline" className="text-charcoal-foreground/60 border-charcoal-foreground/20">
                <MapPin className="h-3 w-3 mr-1" /> {festival.region}, {festival.country}
              </Badge>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-foreground mb-3">
              {festival.name}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-10 adinkra-bg">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <img
                src={festival.image}
                alt={festival.name}
                className="w-full h-72 object-cover rounded-2xl"
              />
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">About This Festival</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{festival.description}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-display font-semibold">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{festival.month}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{festival.region}, {festival.country}</span>
                  </div>
                </div>
              </div>

              {festival.highlights && festival.highlights.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Highlights
                  </h3>
                  <ul className="space-y-2">
                    {festival.highlights.map((h: string) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Music className="h-3.5 w-3.5 mt-0.5 text-primary/60 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
