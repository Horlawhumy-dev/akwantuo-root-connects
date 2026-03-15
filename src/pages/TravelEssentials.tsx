import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Hospital, Bus, Phone, Shield, MapPin, Plane, Ship, Car, Building2,
  CreditCard, Wifi, Luggage, CloudSun, Stamp, Globe, Banknote,
  Smartphone, Droplets, Sun, CloudRain, Thermometer, Printer,
  HandHeart, UtensilsCrossed, Navigation, CheckCircle2, RotateCcw,
  Camera, Heart, HandshakeIcon, ChevronRight, Bell, Cloud
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHospitals, useTransportHubs } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import { usePackingChecklist } from "@/hooks/use-packing-checklist";
import { useActiveSection } from "@/hooks/use-active-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { countryEssentials, COUNTRY_LIST, type CountryEssentials } from "@/data/travel-essentials";

// ─── Shared constants ─────────────────────────────────────────────

const hospitalTypeLabels: Record<string, string> = {
  teaching_hospital: "Teaching Hospital",
  regional_hospital: "Regional Hospital",
  military_hospital: "Military Hospital",
  private_clinic: "Private Clinic",
  mission_hospital: "Mission Hospital",
  hospital: "Hospital",
  clinic: "Clinic",
};

const transportIcons: Record<string, React.ReactNode> = {
  airport: <Plane className="h-4 w-4" />,
  bus_station: <Bus className="h-4 w-4" />,
  port: <Ship className="h-4 w-4" />,
  ride_hailing: <Car className="h-4 w-4" />,
};

const packingEssentials = [
  { category: "Documents", items: ["Passport (6+ months validity)", "Visa (if applicable)", "Yellow fever certificate", "Travel insurance docs", "Hotel booking confirmations", "Copies of all documents (digital + paper)", "2 extra passport photos"] },
  { category: "Health & Safety", items: ["Antimalarials (Malarone or Doxycycline)", "DEET insect repellent (30%+)", "Sunscreen SPF 50+", "Rehydration sachets", "Basic first aid kit", "Hand sanitiser", "Prescription medications"] },
  { category: "Clothing", items: ["Light, breathable cotton/linen", "Long sleeves for evenings (mosquitoes)", "Modest clothing for cultural sites", "Comfortable walking shoes", "Sandals/flip-flops", "Rain jacket (rainy season)", "Hat and sunglasses"] },
  { category: "Tech & Connectivity", items: ["Universal power adapter", "Portable power bank (10,000mAh+)", "Unlocked phone for local SIM", "Offline maps (Google Maps / Maps.me)", "Camera with extra batteries", "Waterproof phone case"] },
  { category: "Practical", items: ["Water bottle with filter", "Dry bag for beach/rain", "Small day backpack", "Flashlight/headlamp", "Notebook and pen", "Ziplock bags for documents", "Snacks for long journeys"] },
];

const FALLBACK_RATES: Record<string, Record<string, number>> = {
  GHS: { USD: 15.5, GBP: 19.8, EUR: 17.2, CAD: 11.3 },
  NGN: { USD: 1550, GBP: 1980, EUR: 1720, CAD: 1130 },
  XOF: { USD: 610, GBP: 780, EUR: 656, CAD: 450 },
};

const CURRENCIES = ["USD", "GBP", "EUR", "CAD"];

const NAV_SECTIONS = [
  { label: "Visa & Entry", id: "visa" },
  { label: "Money", id: "money" },
  { label: "SIM & Wi-Fi", id: "connectivity" },
  { label: "Packing", id: "packing" },
  { label: "Weather", id: "weather" },
  { label: "Etiquette", id: "etiquette" },
  { label: "Food & Water", id: "food" },
  { label: "Getting Around", id: "getting-around" },
  { label: "Hospitals", id: "hospitals" },
  { label: "Transport", id: "transport-section" },
  { label: "Emergency", id: "emergency" },
];

// ─── Helpers ─────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
      <div>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function CurrencyConverter({ country }: { country: CountryEssentials }) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRate = useCallback(async (currency: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ from: currency, to: country.currency.code }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLiveRate(data.rate);
        setLastUpdated(data.updated);
      }
    } catch {
      // fallback silently
    } finally {
      setLoading(false);
    }
  }, [country.currency.code]);

  useEffect(() => {
    setLiveRate(null);
    fetchRate(from);
  }, [from, fetchRate]);

  const fallbackForCurrency = FALLBACK_RATES[country.currency.code] ?? FALLBACK_RATES.XOF;
  const rate = liveRate ?? fallbackForCurrency[from] ?? 610;
  const numericAmount = parseFloat(amount) || 0;
  const converted = numericAmount * rate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-4"
    >
      <h4 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" /> Currency Converter
        {liveRate && <Badge variant="secondary" className="text-[9px] font-normal">Live Rate</Badge>}
        {!liveRate && !loading && <Badge variant="outline" className="text-[9px] font-normal">Offline Rate</Badge>}
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 h-9 text-sm"
          min="0"
        />
        <Select value={from} onValueChange={setFrom}>
          <SelectTrigger className="w-24 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-primary">
            {loading ? "..." : `${country.currency.symbol}${converted.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
          <span className="text-xs text-muted-foreground">{country.currency.code}</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        {liveRate
          ? `1 ${from} = ${country.currency.symbol}${rate.toFixed(2)} ${country.currency.code} • Updated: ${lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "today"}`
          : `Approximate rate: 1 ${from} ≈ ${country.currency.symbol}${rate.toFixed(2)} ${country.currency.code}. Live rates unavailable.`}
      </p>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function TravelEssentials() {
  const [selectedCountry, setSelectedCountry] = useState("ghana");
  const country = countryEssentials[selectedCountry];

  const { data: hospitals, isLoading: loadingH } = useHospitals();
  const { data: hubs, isLoading: loadingT } = useTransportHubs();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const activeSection = useActiveSection(NAV_SECTIONS.map((n) => n.id));
  const packing = usePackingChecklist(packingEssentials);
  const total = packing.totalProgress();

  // Filter hospitals and transport by selected country
  const countryHospitals = useMemo(() =>
    (hospitals ?? []).filter(h => h.country === country.name),
    [hospitals, country.name]
  );
  const countryHubs = useMemo(() =>
    (hubs ?? []).filter(t => t.country === country.name),
    [hubs, country.name]
  );

  const allRegions = useMemo(() =>
    [...new Set([...countryHospitals.map(h => h.region), ...countryHubs.map(t => t.region)])].sort(),
    [countryHospitals, countryHubs]
  );

  // Reset region filter when country changes
  useEffect(() => {
    setActiveRegion(null);
  }, [selectedCountry]);

  if (loadingH || loadingT) return <LoadingSpinner message="Loading travel essentials..." />;

  const filteredHospitals = activeRegion ? countryHospitals.filter(h => h.region === activeRegion) : countryHospitals;
  const filteredHubs = activeRegion ? countryHubs.filter(t => t.region === activeRegion) : countryHubs;

  return (
    <div>
      <SEOHead
        title={`Travel Essentials for ${country.name}`}
        description={`Complete travel guide: visa requirements, currency exchange, SIM cards, packing lists, weather seasons, cultural etiquette, food safety, hospitals, transport, and emergency contacts for ${country.name}.`}
        url="https://akwantu-roots-connect.lovable.app/travel-essentials"
      />

      {/* Hero */}
      <section className="relative py-24 bg-charcoal adinkra-bg-dark print:bg-background print:py-8">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Building2 className="h-10 w-10 text-primary mx-auto mb-4 print:hidden" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-foreground mb-4 print:text-foreground print:text-3xl">
              Travel <span className="text-gradient-kente">Essentials</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-xl mx-auto mb-6 print:text-muted-foreground">
              Everything you need to know before visiting {country.flag} {country.name} — visas, money, SIM cards, what to pack, and when to go.
            </p>

            {/* Country Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 print:hidden">
              {COUNTRY_LIST.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCountry === c.code
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-charcoal-foreground/10 text-charcoal-foreground/70 hover:bg-charcoal-foreground/20"
                  }`}
                >
                  {c.flag} {c.name}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="print:hidden bg-primary/20 text-primary-foreground border border-primary/30 hover:bg-primary/30"
            >
              <Printer className="h-4 w-4 mr-2" /> Print This Guide
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-card border-b border-border sticky top-16 z-30 print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {NAV_SECTIONS.map((nav) => (
              <a
                key={nav.id}
                href={`#${nav.id}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeSection === nav.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {nav.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="adinkra-bg">
        {/* ── Visa & Entry ──────────────────────────────────────── */}
        <section id="visa" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={`visa-${selectedCountry}`}>
              <SectionHeader icon={<Stamp className="h-5 w-5" />} title="Visa & Entry Requirements" subtitle={`What you need before visiting ${country.name}`} />
              <Accordion type="multiple" className="space-y-2">
                {country.visaInfo.map((item, i) => (
                  <AccordionItem key={i} value={`visa-${i}`} className="border border-border rounded-xl bg-card px-5">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">{item.title}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* ── Money & Currency + Converter ──────────────────────── */}
        <section id="money" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={`money-${selectedCountry}`}>
              <SectionHeader icon={<CreditCard className="h-5 w-5" />} title="Money & Currency" subtitle={`How to pay, exchange, and budget in ${country.name}`} />
              <div className="grid md:grid-cols-2 gap-4">
                {country.currencyInfo.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-primary">{item.icon}</span>
                      <h4 className="font-display font-semibold text-sm">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                  </motion.div>
                ))}
              </div>
              <CurrencyConverter country={country} />
            </motion.div>
          </div>
        </section>

        {/* ── SIM & Connectivity ────────────────────────────────── */}
        <section id="connectivity" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={`sim-${selectedCountry}`}>
              <SectionHeader icon={<Wifi className="h-5 w-5" />} title="SIM Cards & Connectivity" subtitle={`Stay connected across ${country.name}`} />
              <div className="rounded-xl border border-border bg-card p-5 mb-4">
                <h4 className="font-display font-semibold text-sm mb-2">How to Get a SIM</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{country.simHow}</p>
              </div>
              <div className={`grid gap-4 mb-4 ${country.simGuide.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                {country.simGuide.map((sim) => (
                  <div key={sim.provider} className="rounded-xl border border-border bg-card p-5">
                    <Badge className={`mb-3 ${sim.color} border-0 text-xs`}>{sim.provider}</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">{sim.details}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="font-display font-semibold text-sm mb-2">Wi-Fi Availability</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{country.wifiNote}</p>
              </div>
              {country.plugType && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Power Plug:</strong> {country.name} uses <strong>{country.plugType}</strong> sockets. Bring a universal adapter.</p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Interactive Packing Checklist ──────────────────────── */}
        <section id="packing" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <SectionHeader icon={<Luggage className="h-5 w-5" />} title="Packing Checklist" subtitle="Tick items off as you pack" />
                <div className="flex items-center gap-3 shrink-0 print:hidden">
                  {total.done > 0 && (
                    <Button variant="ghost" size="sm" onClick={packing.resetAll} className="text-xs text-muted-foreground">
                      <RotateCcw className="h-3 w-3 mr-1" /> Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Country-specific packing extras */}
              {country.packingExtras.length > 0 && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h4 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
                    <Luggage className="h-4 w-4 text-primary" /> Extra for {country.name}
                  </h4>
                  <ul className="flex flex-wrap gap-2">
                    {country.packingExtras.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall progress */}
              <div className="mb-6 print:hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
                  <span className="text-xs font-bold text-primary">{total.done}/{total.total} items</span>
                </div>
                <Progress value={(total.done / total.total) * 100} className="h-2" />
                {packing.syncing && <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Cloud className="h-3 w-3 animate-pulse" /> Syncing...</p>}
              </div>

              {/* Reminder & Trip Date controls */}
              {packing.isLoggedIn && (
                <div className="mb-6 rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 print:hidden">
                  <div className="flex items-center gap-3 flex-1">
                    <Bell className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label htmlFor="reminder-toggle" className="text-sm font-medium cursor-pointer">Email me reminders</label>
                        <Switch
                          id="reminder-toggle"
                          checked={packing.reminderEnabled}
                          onCheckedChange={packing.updateReminder}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Get nudged every few days if your list isn't complete</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Trip date:</label>
                    <Input
                      type="date"
                      value={packing.tripDate || ""}
                      onChange={(e) => packing.updateTripDate(e.target.value || null)}
                      className="h-8 w-40 text-xs"
                    />
                  </div>
                </div>
              )}
              {!packing.isLoggedIn && (
                <p className="text-xs text-muted-foreground mb-6 print:hidden flex items-center gap-1">
                  <Cloud className="h-3 w-3" /> <a href="/login" className="underline text-primary">Log in</a> to sync your checklist across devices & get email reminders.
                </p>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packingEssentials.map((cat) => {
                  const prog = packing.getProgress(cat.category);
                  return (
                    <div key={cat.category} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-display font-semibold text-sm text-primary">{cat.category}</h4>
                        <span className="text-[10px] font-medium text-muted-foreground print:hidden">
                          {prog.done}/{prog.total}
                        </span>
                      </div>
                      <Progress value={(prog.done / prog.total) * 100} className="h-1.5 mb-3 print:hidden" />
                      <ul className="space-y-2">
                        {cat.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <Checkbox
                              checked={!!packing.checked[item]}
                              onCheckedChange={() => packing.toggle(item)}
                              className="mt-0.5 print:hidden"
                            />
                            <span className={`text-sm leading-tight ${packing.checked[item] ? "line-through text-muted-foreground/50" : "text-muted-foreground"}`}>
                              {item}
                            </span>
                            <span className="hidden print:inline mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {total.done === total.total && total.total > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-xl bg-kente-green/10 border border-kente-green/20 p-4 flex items-center gap-3 print:hidden">
                  <CheckCircle2 className="h-5 w-5 text-kente-green shrink-0" />
                  <p className="text-sm font-medium text-kente-green">All packed! You're ready for {country.flag} {country.name}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Weather & Seasons ──────────────────────────────────── */}
        <section id="weather" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={`weather-${selectedCountry}`}>
              <SectionHeader icon={<CloudSun className="h-5 w-5" />} title="Weather & Best Time to Visit" subtitle={`${country.name}'s seasons at a glance`} />
              <div className="space-y-3">
                {country.weatherSeasons.map((s, i) => (
                  <motion.div key={s.season} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 sm:w-56 shrink-0">
                      <span className="text-primary">{s.icon}</span>
                      <div>
                        <h4 className="font-display font-semibold text-sm">{s.season}</h4>
                        <p className="text-xs text-muted-foreground">{s.months}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:w-28 shrink-0">
                      <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{s.temp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.description}</p>
                    {s.best && (
                      <Badge className="bg-kente-green/10 text-kente-green border-0 text-[10px] shrink-0 self-start sm:self-center">Best Time</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Cultural Etiquette ──────────────────────────────────── */}
        <section id="etiquette" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={`etiquette-${selectedCountry}`}>
              <SectionHeader icon={<HandHeart className="h-5 w-5" />} title="Cultural Etiquette" subtitle={`Respect local customs in ${country.name}`} />
              <div className="grid md:grid-cols-2 gap-4">
                {country.etiquetteGuide.map((cat, i) => (
                  <motion.div key={cat.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-primary">{cat.icon}</span>
                      <h4 className="font-display font-semibold text-sm">{cat.title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {cat.tips.map((tip) => (
                        <li key={tip} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Food & Water Safety ─────────────────────────────────── */}
        <section id="food" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={`food-${selectedCountry}`}>
              <SectionHeader icon={<UtensilsCrossed className="h-5 w-5" />} title="Food & Water Safety" subtitle={`Eat well, stay well in ${country.name}`} />
              <div className="grid md:grid-cols-2 gap-4">
                {country.foodSafetyGuide.map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-primary">{item.icon}</span>
                      <h4 className="font-display font-semibold text-sm">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Getting Around ──────────────────────────────────────── */}
        <section id="getting-around" className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={`transport-${selectedCountry}`}>
              <SectionHeader icon={<Navigation className="h-5 w-5" />} title={`Getting Around ${country.name}`} subtitle="Transport options at every budget" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {country.gettingAroundGuide.map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-primary">{item.icon}</span>
                      <h4 className="font-display font-semibold text-sm">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Hospitals, Transport, Emergency ───────────────────── */}
        <section id="hospitals" className="py-16">
          <div className="container mx-auto px-4">
            {/* Region filter */}
            {allRegions.length > 0 && (
              <div className="mb-8 print:hidden">
                <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">Filter by Region</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveRegion(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeRegion ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    All Regions
                  </button>
                  {allRegions.map(r => (
                    <button
                      key={r}
                      onClick={() => setActiveRegion(activeRegion === r ? null : r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeRegion === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="hospitals" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md print:hidden">
                <TabsTrigger value="hospitals" className="gap-2"><Hospital className="h-4 w-4" /> Hospitals</TabsTrigger>
                <TabsTrigger value="transport" className="gap-2"><Bus className="h-4 w-4" /> Transport</TabsTrigger>
                <TabsTrigger value="emergency" className="gap-2"><Phone className="h-4 w-4" /> Emergency</TabsTrigger>
              </TabsList>

              <TabsContent value="hospitals" id="hospitals-tab">
                {filteredHospitals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Hospital className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No hospitals listed for {country.name} yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredHospitals.map((h) => (
                      <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-display font-semibold text-sm leading-tight">{h.name}</h4>
                          {h.emergency && <Badge variant="destructive" className="text-[10px] shrink-0 ml-2">24/7</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px]">{hospitalTypeLabels[h.type] || h.type}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{h.region}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{h.description}</p>
                        {h.phone && (
                          <a href={`tel:${h.phone}`} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" /> {h.phone}</a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transport" id="transport-section">
                {filteredHubs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No transport hubs listed for {country.name} yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredHubs.map((t) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-primary">{transportIcons[t.type] || <Bus className="h-4 w-4" />}</span>
                          <h4 className="font-display font-semibold text-sm leading-tight">{t.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px] capitalize">{t.type.replace('_', ' ')}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{t.region}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t.description}</p>
                        {t.phone && (
                          <a href={`tel:${t.phone}`} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" /> {t.phone}</a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="emergency" id="emergency">
                <div className="max-w-2xl">
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-destructive" />
                      <h3 className="font-display font-semibold">Emergency Contacts — {country.flag} {country.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Save these numbers before travelling to {country.name}.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {country.emergencyContacts.map((c) => (
                        <a key={c.number} href={`tel:${c.number}`} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                          <div>
                            <p className="text-sm font-semibold">{c.label}</p>
                            <p className="text-[10px] text-muted-foreground">{c.description}</p>
                          </div>
                          <span className="text-primary font-mono font-bold text-sm">{c.number}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h4 className="font-display font-semibold mb-2">Travel Insurance Tip</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{country.insuranceTip}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </div>
  );
}
