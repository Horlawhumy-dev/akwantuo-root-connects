import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Map } from "lucide-react";

// Country coordinates for map markers
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  ghana: { lat: 7.9465, lng: -1.0232 },
  nigeria: { lat: 9.082, lng: 8.6753 },
  senegal: { lat: 14.4974, lng: -14.4524 },
  mali: { lat: 17.5707, lng: -3.9962 },
  benin: { lat: 9.3077, lng: 2.3158 },
  togo: { lat: 8.6195, lng: 1.2080 },
  "cote-divoire": { lat: 7.5400, lng: -5.5471 },
  kenya: { lat: -0.0236, lng: 37.9062 },
  "south-africa": { lat: -30.5595, lng: 22.9375 },
  tanzania: { lat: -6.3690, lng: 34.8888 },
  ethiopia: { lat: 9.1450, lng: 40.4897 },
  morocco: { lat: 31.7917, lng: -7.0926 },
  rwanda: { lat: -1.9403, lng: 29.8739 },
  cameroon: { lat: 7.3697, lng: 12.3547 },
};

interface AfricaMapProps {
  destinations: any[];
}

export function AfricaMap({ destinations }: AfricaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const activeIdRef = useRef<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [5, 10],
      zoom: 3,
      minZoom: 2,
      maxZoom: 6,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    L.control.attribution({ position: "bottomright" }).addTo(map);

    const defaultStyles: Record<string, { radius: number; fillColor: string; color: string }> = {};

    destinations.forEach((dest) => {
      const coords = COUNTRY_COORDS[dest.id];
      if (!coords) return;

      const isTier1 = dest.tier === 1;
      const color = isTier1 ? "#c8922a" : "#6b7280";
      const borderColor = isTier1 ? "#fef3c7" : "#9ca3af";
      const radius = isTier1 ? 10 : 7;

      defaultStyles[dest.id] = { radius, fillColor: color, color: borderColor };

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius,
        fillColor: color,
        color: borderColor,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      markersRef.current[dest.id] = marker;

      const popupContent = `
        <div style="font-family: inherit; min-width: 140px;">
          <strong style="font-size: 14px;">${dest.country}</strong>
          <p style="margin: 4px 0 0; font-size: 11px; color: #9ca3af; font-style: italic;">${dest.tagline}</p>
          ${isTier1 ? `<p style="margin: 6px 0 0; font-size: 11px; color: #c8922a; cursor: pointer;" class="explore-link" data-id="${dest.id}">Explore →</p>` : `<p style="margin: 6px 0 0; font-size: 11px; color: #6b7280;">Coming Soon</p>`}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "africa-map-popup",
        closeButton: false,
      });

      marker.on("click", () => {
        // Reset previous active marker
        if (activeIdRef.current && activeIdRef.current !== dest.id && markersRef.current[activeIdRef.current]) {
          const prev = markersRef.current[activeIdRef.current];
          const prevStyle = defaultStyles[activeIdRef.current];
          if (prevStyle) {
            prev.setRadius(prevStyle.radius);
            prev.setStyle({ fillColor: prevStyle.fillColor, color: prevStyle.color, weight: 2 });
          }
        }

        // Fly to clicked marker
        map.flyTo([coords.lat, coords.lng], 5, {
          duration: 1.2,
          easeLinearity: 0.25,
        });

        // Highlight active marker
        marker.setRadius(isTier1 ? 14 : 11);
        marker.setStyle({
          fillColor: isTier1 ? "#e5a832" : "#9ca3af",
          color: "#ffffff",
          weight: 3,
        });

        activeIdRef.current = dest.id;

        // Open popup after fly animation
        setTimeout(() => marker.openPopup(), 600);
      });
    });

    // Reset view on clicking empty map area
    map.on("click", () => {
      if (activeIdRef.current && markersRef.current[activeIdRef.current]) {
        const prev = markersRef.current[activeIdRef.current];
        const prevStyle = defaultStyles[activeIdRef.current];
        if (prevStyle) {
          prev.setRadius(prevStyle.radius);
          prev.setStyle({ fillColor: prevStyle.fillColor, color: prevStyle.color, weight: 2 });
        }
        activeIdRef.current = null;
      }
      map.flyTo([5, 10], 3, { duration: 1.0 });
    });

    // Handle explore link clicks via event delegation
    map.on("popupopen", (e: any) => {
      const popup = e.popup;
      const container = popup.getElement();
      if (!container) return;
      const link = container.querySelector(".explore-link");
      if (link) {
        link.addEventListener("click", () => {
          const id = link.getAttribute("data-id");
          if (id) navigate(`/destinations/${id}`);
        });
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markersRef.current = {};
      activeIdRef.current = null;
    };
  }, [destinations, navigate]);

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-0 text-xs gap-1">
            <Map className="h-3 w-3" /> Interactive Map
          </Badge>
          <h2 className="font-display text-2xl lg:text-3xl font-bold mb-2 tracking-tight">
            Explore the Continent
          </h2>
          <p className="text-muted-foreground">
            Click on any marker to learn more about our African destinations
          </p>
        </div>
        <div
          ref={mapRef}
          className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border"
        />
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary inline-block" />
            Full Coverage
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-muted-foreground inline-block" />
            Coming Soon
          </span>
        </div>
      </div>
    </section>
  );
}
