import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, BookOpen, Shield, ChevronDown, Hospital, Bus, CalendarDays, Plane, Phone, Globe, Heart, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdinkraIcon } from "@/components/ui/AdinkraIcon";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { SEOHead } from "@/components/SEOHead";
import { useHospitals, useTransportHubs, useEvents } from "@/hooks/use-supabase-data";
import { format, parseISO, isBefore } from "date-fns";

const stats = [
  { label: "Regions Mapped", value: "16", icon: <Globe className="h-4 w-4" /> },
  { label: "Historic Sites", value: "120+", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Festivals", value: "50+", icon: <Sparkles className="h-4 w-4" /> },
  { label: "Verified Hosts", value: "200+", icon: <Heart className="h-4 w-4" /> },
];

const pillars = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Sankofa Archive",
    description: "Explore centuries of history, culture, cuisine and hidden gems curated by local historians.",
    to: "/archive",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Curated Stays",
    description: "Book authentic guest houses, boutique hotels and homestays vetted by the community.",
    to: "/stays",
    accent: "from-secondary/20 to-secondary/5",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Safety Concierge",
    description: "Travel with confidence using our real-time safety map and local guide network.",
    to: "/safety",
    accent: "from-accent/20 to-accent/5",
  },
];

export default function Index() {
  const { data: hospitals } = useHospitals();
  const { data: hubs } = useTransportHubs();
  const { data: events } = useEvents();

  const now = new Date();
  const upcomingEvents = (events ?? [])
    .filter(e => !isBefore(parseISO(e.date_start), now))
    .sort((a, b) => a.date_start.localeCompare(b.date_start))
    .slice(0, 3);

  const hospitalCount = (hospitals ?? []).length;
  const emergencyCount = (hospitals ?? []).filter((h: any) => h.emergency).length;
  const airportCount = (hubs ?? []).filter((h: any) => h.type === "airport").length;
  const busCount = (hubs ?? []).filter((h: any) => h.type === "bus_station").length;

  return (
    <div>
      <SEOHead
        title="Akwantuo — Journey to Your Roots in West Africa"
        description="Navigate West Africa without the stress. Curated stays, real-time safety info, and local insights for a seamless travel experience."
        url="https://akwantu-roots-connect.lovable.app"
        image="https://akwantu-roots-connect.lovable.app/og-image.jpg"
        jsonLd={{ "@type": "TravelAgency", name: "Akwantuo", description: "Travel platform helping visitors navigate West Africa with confidence — stays, safety, culture, and logistics in one place", url: "https://akwantu-roots-connect.lovable.app" }}
      />
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-charcoal adinkra-bg-dark overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        
        {/* Decorative floating elements */}
        <div className="absolute top-20 left-10 opacity-10 animate-float">
          <AdinkraIcon name="gye-nyame" size={120} className="text-primary" />
        </div>
        <div className="absolute bottom-32 right-10 opacity-10 animate-float" style={{ animationDelay: "1.5s" }}>
          <AdinkraIcon name="dwennimmen" size={80} className="text-primary" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <AdinkraIcon name="sankofa" size={56} className="text-primary mx-auto mb-6" />
            </motion.div>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-[1.1] tracking-tight">
              Travel West Africa
              <br />
              <span className="text-gradient-kente italic">Without the Stress</span>
            </h1>
            <p className="text-lg sm:text-xl text-charcoal-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Payments, transport, food, internet — navigating everyday systems in
              West Africa can be overwhelming. Akwantuo cuts through the confusion
              so you can focus on the experience.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button size="lg" asChild className="text-base px-8 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Link to="/destinations">
                  Explore Destinations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-8 h-12 rounded-xl border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm"
              >
                <Link to="/archive">Browse Archive</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6 text-charcoal-foreground/25" />
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-3">
                  {s.icon}
                </div>
                <p className="font-display text-3xl sm:text-4xl font-bold text-primary">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value propositions */}
      <section className="py-24 adinkra-bg">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-medium">
              <Users className="h-3 w-3 mr-1" /> Why Akwantuo
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Your Gateway to <span className="italic text-gradient-kente">West Africa</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Three pillars that make Akwantuo the most reliable travel companion
              for visitors to West Africa.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link
                  to={p.to}
                  className="group block rounded-2xl border border-border bg-card p-8 card-hover relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="mb-5 inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {p.icon}
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-3">
                      {p.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {p.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Reassurance Strip */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              Travel With <span className="text-gradient-kente italic">Confidence</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              We've mapped out the logistics so you can focus on the experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
            {[
              { icon: <Hospital className="h-5 w-5" />, value: `${hospitalCount}`, label: "Hospitals & Clinics", sub: `${emergencyCount} with 24/7 emergency` },
              { icon: <Plane className="h-5 w-5" />, value: `${airportCount}`, label: "Airports", sub: "Domestic & international" },
              { icon: <Bus className="h-5 w-5" />, value: `${busCount}`, label: "Bus Terminals", sub: "Intercity coach services" },
              { icon: <Phone className="h-5 w-5" />, value: "112", label: "Emergency Line", sub: "Universal toll-free number" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-background p-5 md:p-6 text-center card-hover"
              >
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary mb-3">
                  {item.icon}
                </div>
                <p className="font-display text-2xl md:text-3xl font-bold text-primary">{item.value}</p>
                <p className="text-sm font-medium mt-1">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" /> Upcoming Events
                </h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/events" className="gap-1 text-primary">View all <ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {upcomingEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to="/events"
                      className="group block rounded-2xl border border-border bg-background overflow-hidden card-hover"
                    >
                      {ev.image && (
                        <div className="h-40 overflow-hidden">
                          <img src={ev.image} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        </div>
                      )}
                      <div className="p-5">
                        <Badge variant="secondary" className="text-[10px] capitalize mb-2">{ev.category}</Badge>
                        <h4 className="font-display font-semibold text-sm mb-1.5">{ev.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CalendarDays className="h-3 w-3" />
                          {format(parseISO(ev.date_start), "MMM d, yyyy")}
                          <span className="mx-1 text-border">·</span>
                          <MapPin className="h-3 w-3" />
                          {ev.region}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild className="rounded-xl">
              <Link to="/travel-essentials" className="gap-2">
                <Shield className="h-4 w-4" /> View All Travel Essentials
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Guest Testimonials */}
      <TestimonialsCarousel />

      {/* CTA */}
      <section className="py-24 bg-charcoal adinkra-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-1/4 animate-float">
            <AdinkraIcon name="sankofa" size={100} className="text-primary" />
          </div>
          <div className="absolute bottom-10 right-1/4 animate-float" style={{ animationDelay: "2s" }}>
            <AdinkraIcon name="adinkrahene" size={80} className="text-primary" />
          </div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AdinkraIcon name="gye-nyame" size={48} className="text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-foreground mb-4 tracking-tight">
              Ready to Begin <span className="italic">Your Journey?</span>
            </h2>
            <p className="text-charcoal-foreground/60 max-w-lg mx-auto mb-8 text-lg">
              Join thousands of travelers exploring West Africa with confidence
              through Akwantuo.
            </p>
            <Button size="lg" asChild className="text-base px-10 h-12 rounded-xl shadow-lg">
              <Link to="/signup">
                Start Your Akwantuo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
