import { Link } from "react-router-dom";
import { AdinkraIcon } from "@/components/ui/AdinkraIcon";
import { Globe, Instagram, Twitter } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Destinations", to: "/destinations" },
      { label: "Sankofa Archive", to: "/archive" },
      { label: "Festivals", to: "/festivals" },
      { label: "Events", to: "/events" },
      { label: "Safety Map", to: "/safety" },
    ],
  },
  {
    title: "Travel",
    links: [
      { label: "Browse Stays", to: "/stays" },
      { label: "List Your Stay", to: "/stays/submit" },
      { label: "Travel Essentials", to: "/travel-essentials" },
      { label: "Trip Planner", to: "/itineraries" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Bookings", to: "/my-bookings" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Host Dashboard", to: "/host/dashboard" },
      { label: "Profile", to: "/profile" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Instagram", to: "#" },
      { label: "Twitter / X", to: "#" },
      { label: "TikTok", to: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-charcoal-foreground adinkra-bg-dark">
      <div className="kente-strip" />
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <AdinkraIcon name="sankofa" size={28} className="text-primary" />
              <span className="font-display text-lg font-bold text-primary">
                Akwantuo
              </span>
            </Link>
            <p className="text-sm text-charcoal-foreground/60 leading-relaxed mb-3 italic font-display">
              "Se wo were fi na wosankofa a yenkyi."
            </p>
            <p className="text-xs text-charcoal-foreground/40 leading-relaxed">
              It is not wrong to go back for that which you have forgotten.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
                { icon: <Twitter className="h-4 w-4" />, label: "Twitter" },
                { icon: <Globe className="h-4 w-4" />, label: "Website" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  className="h-9 w-9 rounded-full bg-charcoal-foreground/10 flex items-center justify-center text-charcoal-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-primary/80 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-charcoal-foreground/55 hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-charcoal-foreground/8 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-charcoal-foreground/35">
            © {new Date().getFullYear()} Akwantuo. Crafted with cultural intention.
          </p>
          <div className="flex items-center gap-2">
            <AdinkraIcon name="gye-nyame" size={14} className="text-charcoal-foreground/20" />
            <span className="text-[11px] text-charcoal-foreground/25 italic font-display">
              Except God
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
