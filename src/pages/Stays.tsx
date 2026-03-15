import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Star, Plus, Home, Building2, House, Map, LayoutGrid } from "lucide-react";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type Stay = {
  id: string;
  name: string;
  description: string;
  country: string;
  region: string;
  type: "guesthouse" | "boutique_hotel" | "homestay";
  price_range: "budget" | "mid_range" | "luxury";
  amenities: string[];
  image_urls: string[];
  host_name: string;
  status: string;
  latitude?: number;
  longitude?: number;
  avg_rating?: number;
  review_count?: number;
};

const typeLabels: Record<string, string> = {
  guesthouse: "Guest House",
  boutique_hotel: "Boutique Hotel",
  homestay: "Homestay",
};

const typeIcons: Record<string, React.ReactNode> = {
  guesthouse: <House className="h-4 w-4" />,
  boutique_hotel: <Building2 className="h-4 w-4" />,
  homestay: <Home className="h-4 w-4" />,
};

const priceLabels: Record<string, string> = {
  budget: "$",
  mid_range: "$$",
  luxury: "$$$",
};

const countries = ["Ghana", "Senegal", "Nigeria", "Côte d'Ivoire", "Mali"];

const amenityOptions = [
  "Wi-Fi", "Pool", "Air Conditioning", "Breakfast", "Airport Transfer",
  "Kitchen", "Parking", "Laundry", "Tour Guide", "Cultural Experience",
];

function LeafletMap({ stays, typeLabels: tl, priceLabels: pl }: { stays: Stay[]; typeLabels: Record<string, string>; priceLabels: Record<string, string> }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([8.5, -3.5], 5);
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
    map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer); });
    stays.forEach((stay) => {
      if (!stay.latitude || !stay.longitude) return;
      const marker = L.marker([stay.latitude, stay.longitude]).addTo(map);
      const imgHtml = stay.image_urls?.[0]
        ? `<img src="${stay.image_urls[0]}" alt="${stay.name}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`
        : "";
      marker.bindPopup(`
        <div style="min-width:180px;cursor:pointer;" class="stay-popup" data-stay-id="${stay.id}">
          ${imgHtml}
          <strong style="font-size:13px;">${stay.name}</strong>
          <div style="font-size:11px;color:#888;margin-top:2px;">${stay.region}, ${stay.country}</div>
          <div style="margin-top:4px;">
            <span style="font-size:10px;background:#f3f3f3;padding:2px 6px;border-radius:4px;">${tl[stay.type]}</span>
            <span style="font-size:11px;font-weight:600;margin-left:4px;">${pl[stay.price_range]}</span>
          </div>
        </div>
      `);
      marker.on("popupopen", () => {
        const el = document.querySelector(`.stay-popup[data-stay-id="${stay.id}"]`);
        el?.addEventListener("click", () => navigate(`/stays/${stay.id}`));
      });
    });
  }, [stays, tl, pl, navigate]);

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: "500px" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export default function Stays() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const { data: stays = [], isLoading } = useQuery({
    queryKey: ["stays"],
    queryFn: async () => {
      const { data: staysData, error } = await supabase
        .from("stays")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch average ratings
      const { data: reviews } = await supabase
        .from("stay_reviews")
        .select("stay_id, rating");

      const ratingMap: Record<string, { sum: number; count: number }> = {};
      (reviews || []).forEach((r: any) => {
        if (!ratingMap[r.stay_id]) ratingMap[r.stay_id] = { sum: 0, count: 0 };
        ratingMap[r.stay_id].sum += r.rating;
        ratingMap[r.stay_id].count += 1;
      });

      return (staysData || []).map((s: any) => ({
        ...s,
        avg_rating: ratingMap[s.id] ? ratingMap[s.id].sum / ratingMap[s.id].count : undefined,
        review_count: ratingMap[s.id]?.count || 0,
      })) as Stay[];
    },
  });

  const filtered = useMemo(() => {
    return stays.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
          !s.region.toLowerCase().includes(search.toLowerCase())) return false;
      if (countryFilter !== "all" && s.country !== countryFilter) return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (priceFilter !== "all" && s.price_range !== priceFilter) return false;
      if (amenityFilter.length > 0 && !amenityFilter.every((a) => s.amenities?.includes(a))) return false;
      return true;
    });
  }, [stays, search, countryFilter, typeFilter, priceFilter, amenityFilter]);

  const staysWithCoords = filtered.filter((s) => s.latitude && s.longitude);

  const toggleAmenity = (amenity: string) => {
    setAmenityFilter((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Center map on West Africa
  const mapCenter: [number, number] = [8.5, -3.5];

  return (
    <div>
      <SEOHead title="Curated Stays in West Africa" description="Handpicked guest houses, boutique hotels, and homestays offering authentic West African experiences." url="https://akwantu-roots-connect.lovable.app/stays" />
      {/* Hero */}
      <section className="relative py-28 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Home className="h-3 w-3 mr-1" /> Curated Stays
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-foreground mb-4 tracking-tight">
              Where to Stay in <span className="italic">West Africa</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-2xl mx-auto text-lg">
              Handpicked guest houses, boutique hotels, and homestays that offer authentic experiences
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Listings */}
      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4">
          {/* Search & Filters */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or region..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Stay Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guesthouse">Guest House</SelectItem>
                  <SelectItem value="boutique_hotel">Boutique Hotel</SelectItem>
                  <SelectItem value="homestay">Homestay</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget ($)</SelectItem>
                  <SelectItem value="mid_range">Mid-Range ($$)</SelectItem>
                  <SelectItem value="luxury">Luxury ($$$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amenity chips */}
            <div className="flex flex-wrap gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground mt-1" />
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    amenityFilter.includes(amenity)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "stay" : "stays"} found
              </p>
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Map className="h-3.5 w-3.5" /> Map
                </button>
              </div>
            </div>
            {user && (
              <Button asChild>
                <Link to="/stays/submit">
                  <Plus className="h-4 w-4 mr-2" /> List Your Stay
                </Link>
              </Button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No stays found</h3>
              <p className="text-muted-foreground mb-4">
                {stays.length === 0
                  ? "Be the first to list a stay in West Africa!"
                  : "Try adjusting your filters"}
              </p>
              {user && (
                <Button asChild>
                  <Link to="/stays/submit">
                    <Plus className="h-4 w-4 mr-2" /> List Your Stay
                  </Link>
                </Button>
              )}
            </div>
          ) : viewMode === "map" ? (
            <LeafletMap stays={staysWithCoords} typeLabels={typeLabels} priceLabels={priceLabels} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((stay, i) => (
                <motion.div
                  key={stay.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/stays/${stay.id}`} className="group block">
                    <div className="bg-card rounded-2xl border border-border overflow-hidden card-hover">
                      <div className="relative h-48 overflow-hidden">
                        {stay.image_urls?.[0] ? (
                          <img
                            src={stay.image_urls[0]}
                            alt={stay.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            {typeIcons[stay.type]}
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-card/90 text-foreground border-0">
                          {typeIcons[stay.type]}
                          <span className="ml-1">{typeLabels[stay.type]}</span>
                        </Badge>
                        <WishlistButton itemType="stay" itemId={stay.id} className="absolute top-3 right-3" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                          {stay.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {stay.region}, {stay.country}
                        </div>
                        {stay.avg_rating !== undefined && (
                          <div className="flex items-center gap-1 text-sm mb-2">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            <span className="font-medium">{stay.avg_rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({stay.review_count})</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {stay.description}
                        </p>
                        {stay.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {stay.amenities.slice(0, 3).map((a) => (
                              <Badge key={a} variant="secondary" className="text-[10px]">
                                {a}
                              </Badge>
                            ))}
                            {stay.amenities.length > 3 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{stay.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
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
