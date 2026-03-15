import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, XCircle, MapPin, Calendar, User, Mail, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSafetyZones } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type SafetyLevel = "safe" | "caution" | "restricted";

const levelConfig: Record<SafetyLevel, { icon: React.ReactNode; color: string; bg: string; label: string; mapColor: string }> = {
  safe: { icon: <CheckCircle className="h-4 w-4" />, color: "text-kente-green", bg: "bg-kente-green/10", label: "Safe", mapColor: "#2d6a30" },
  caution: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-primary", bg: "bg-primary/10", label: "Caution", mapColor: "#c99a2a" },
  restricted: { icon: <XCircle className="h-4 w-4" />, color: "text-destructive", bg: "bg-destructive/10", label: "Restricted", mapColor: "#cc3333" },
};

// Ghana region approximate center coordinates
const regionCoords: Record<string, [number, number]> = {
  "Greater Accra": [5.614818, -0.205874],
  "Ashanti": [6.747222, -1.520556],
  "Western": [5.4, -2.1],
  "Central": [5.4, -1.0],
  "Eastern": [6.2, -0.5],
  "Volta": [6.6, 0.5],
  "Northern": [9.5, -1.0],
  "Upper East": [10.7, -1.0],
  "Upper West": [10.3, -2.3],
  "Bono": [7.5, -2.3],
  "Bono East": [7.7, -1.6],
  "Ahafo": [7.0, -2.4],
  "Oti": [7.7, 0.3],
  "Savannah": [9.0, -1.8],
  "North East": [10.3, -0.3],
  "Western North": [6.3, -2.8],
};

function SafetyMap({ zones, activeLevel, selectedZoneId, onSelectZone }: {
  zones: any[];
  activeLevel: string | null;
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([7.9, -1.0], 7);
    mapInstanceRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = activeLevel ? zones.filter(z => z.level === activeLevel) : zones;

    filtered.forEach((zone) => {
      const coords = regionCoords[zone.name] || regionCoords[zone.region];
      if (!coords) return;

      const cfg = levelConfig[zone.level as SafetyLevel];
      const isSelected = selectedZoneId === zone.id;

      const circle = L.circleMarker(coords, {
        radius: isSelected ? 18 : 12,
        fillColor: cfg.mapColor,
        color: isSelected ? "#fff" : cfg.mapColor,
        weight: isSelected ? 3 : 2,
        opacity: 0.9,
        fillOpacity: isSelected ? 0.5 : 0.3,
      }).addTo(map);

      circle.bindPopup(`
        <div style="min-width:160px;">
          <strong style="font-size:13px;">${zone.name}</strong>
          <div style="font-size:11px;color:${cfg.mapColor};font-weight:600;margin:4px 0;">${cfg.label}</div>
          <p style="font-size:11px;color:#888;line-height:1.4;">${zone.description.slice(0, 120)}${zone.description.length > 120 ? '...' : ''}</p>
        </div>
      `);

      circle.on("click", () => onSelectZone(isSelected ? null : zone.id));
      markersRef.current.push(circle);
    });
  }, [zones, activeLevel, selectedZoneId, onSelectZone]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: "450px" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

function RequestGuideDialog({ regions }: { regions: string[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    region: "",
    startDate: "",
    endDate: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.region || !formData.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    // Simulate API call - in production this would save to database or send email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Guide request submitted!", {
      description: "We'll match you with a verified local guide and contact you within 24 hours.",
    });
    
    setFormData({ name: "", email: "", region: "", startDate: "", endDate: "", message: "" });
    setOpen(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          Request a Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Request a Local Guide</DialogTitle>
          <DialogDescription>
            Our verified guides are locals who know the area, culture, and can help you travel safely.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Name *
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Region / Destination *
            </Label>
            <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Additional Details
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your trip plans, any specific needs, or questions..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Safety() {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const { data: safetyZones, isLoading } = useSafetyZones();

  const zones = safetyZones ?? [];
  const filtered = activeLevel ? zones.filter((z) => z.level === activeLevel) : zones;
  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  // Get unique regions for the guide request form
  const uniqueRegions = [...new Set(zones.map(z => z.name))].sort();

  if (isLoading) return <LoadingSpinner message="Loading safety data..." />;

  return (
    <div>
      <SEOHead title="Safety Concierge" description="Region-by-region safety advisories for West Africa. Travel with confidence using our real-time safety map." url="https://akwantu-roots-connect.lovable.app/safety" />
      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary mb-5">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-foreground mb-4 tracking-tight">
              Safety <span className="text-gradient-kente italic">Concierge</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-xl mx-auto text-lg">
              Travel with confidence. Our region-by-region safety advisories help you plan smarter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map + Sidebar */}
      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2 space-y-4">
              <SafetyMap
                zones={zones}
                activeLevel={activeLevel}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
              />

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                {(["safe", "caution", "restricted"] as const).map((level) => (
                  <span key={level} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: levelConfig[level].mapColor }} />
                    <span className={levelConfig[level].color}>{levelConfig[level].label}</span>
                  </span>
                ))}
              </div>

              {/* Selected zone detail */}
              {selectedZone && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={levelConfig[selectedZone.level as SafetyLevel].color}>
                      {levelConfig[selectedZone.level as SafetyLevel].icon}
                    </span>
                    <h4 className="font-display font-semibold">{selectedZone.name}</h4>
                    <Badge className={`${levelConfig[selectedZone.level as SafetyLevel].bg} ${levelConfig[selectedZone.level as SafetyLevel].color} border-0 text-xs`}>
                      {levelConfig[selectedZone.level as SafetyLevel].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedZone.description}</p>
                </motion.div>
              )}

              {/* Zone grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {filtered.map((zone) => {
                  const cfg = levelConfig[zone.level as SafetyLevel];
                  const isSelected = selectedZoneId === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`flex items-center gap-1 ${cfg.color} mb-1`}>
                        {cfg.icon}
                        <span className="text-[10px] font-medium">{cfg.label}</span>
                      </div>
                      <p className="text-xs font-medium truncate">{zone.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Filter by Level</h3>
              <div className="space-y-2 mb-8">
                {(["safe", "caution", "restricted"] as const).map((level) => {
                  const cfg = levelConfig[level];
                  const count = zones.filter((z) => z.level === level).length;
                  return (
                    <button
                      key={level}
                      onClick={() => setActiveLevel(activeLevel === level ? null : level)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        activeLevel === level ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`flex items-center gap-2 ${cfg.color}`}>
                        {cfg.icon}
                        <span className="text-sm font-medium">{cfg.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{count} regions</span>
                    </button>
                  );
                })}
              </div>

              {/* Emergency info */}
              <div className="bg-card rounded-xl border border-border p-5 mb-6">
                <h4 className="font-display font-semibold mb-3">Emergency Numbers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Police</span><span className="font-medium">191</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fire</span><span className="font-medium">192</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ambulance</span><span className="font-medium">193</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Universal</span><span className="font-medium text-primary">112</span></div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h4 className="font-display font-semibold mb-2">Need a Local Guide?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Our verified local guides can accompany you in caution areas for a safer experience.
                </p>
                <RequestGuideDialog regions={uniqueRegions.length > 0 ? uniqueRegions : ["Greater Accra", "Ashanti", "Central", "Western", "Eastern", "Volta", "Northern"]} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
