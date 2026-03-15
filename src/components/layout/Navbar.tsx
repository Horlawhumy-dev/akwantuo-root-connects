import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogOut, CalendarCheck, Home, Heart, MapIcon, BarChart3, Store, ChevronDown, Briefcase, Bed, ShoppingBag, Calendar, Archive, BookOpen, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AdinkraIcon } from "@/components/ui/AdinkraIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onSearchOpen?: () => void;
}

const publicLinks = [
  { label: "Destinations", to: "/destinations" },
  { label: "Festivals", to: "/festivals" },
  { label: "Safety", to: "/safety" },
];

const serviceLinks = [
  { label: "Stays", to: "/stays", icon: Bed },
  { label: "Marketplace", to: "/marketplace", icon: ShoppingBag },
  { label: "Events", to: "/events", icon: Calendar },
  { label: "Archive", to: "/archive", icon: Archive },
  { label: "Essentials", to: "/travel-essentials", icon: BookOpen },
  { label: "AI Planner", to: "/trip-planner", icon: Sparkles },
];

export function Navbar({ onSearchOpen }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-card/95 backdrop-blur-xl shadow-sm border-b border-border"
          : "bg-transparent"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="kente-strip" />
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Akwantuo home">
          <AdinkraIcon
            name="sankofa"
            size={30}
            className="text-primary transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-display text-xl font-bold text-gradient-kente tracking-tight">
            Akwantuo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                isActive(link.to)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/65 hover:text-foreground hover:bg-muted/80"
              )}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 gap-1",
                  serviceLinks.some(l => isActive(l.to))
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/65 hover:text-foreground hover:bg-muted/80"
                )}
              >
                <Briefcase className="h-4 w-4" />
                Services
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48 rounded-xl">
              {serviceLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link
                      to={link.to}
                      className={cn(
                        "gap-2 cursor-pointer",
                        isActive(link.to) && "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchOpen}
            className="gap-2 text-muted-foreground hover:text-foreground"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          {!user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-lg shadow-sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="gap-2"><User className="h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-bookings" className="gap-2"><CalendarCheck className="h-4 w-4" /> My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="gap-2"><Heart className="h-4 w-4" /> Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/itineraries" className="gap-2"><MapIcon className="h-4 w-4" /> Trip Planner</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/host/dashboard" className="gap-2"><BarChart3 className="h-4 w-4" /> Host Analytics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/host/bookings" className="gap-2"><Home className="h-4 w-4" /> Host Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/marketplace/my-shops" className="gap-2"><Store className="h-4 w-4" /> My Shops</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu — slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-0 bg-charcoal/50 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-card border-l border-border z-50 overflow-y-auto"
              role="menu"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <AdinkraIcon name="sankofa" size={28} className="text-primary" />
                    <span className="font-display text-lg font-bold text-gradient-kente">Akwantuo</span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-1 mb-6">
                  {/* Main public links */}
                  {publicLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.to}
                        className={cn(
                          "flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors",
                          isActive(link.to)
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                        )}
                        role="menuitem"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Services Section */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: publicLinks.length * 0.05 }}
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                      Services
                    </div>
                    {serviceLinks.map((link, i) => {
                      const Icon = link.icon;
                      return (
                        <motion.div
                          key={link.to}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (publicLinks.length + i + 1) * 0.05 }}
                        >
                          <Link
                            to={link.to}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                              isActive(link.to)
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground/70 hover:bg-muted hover:text-foreground"
                            )}
                            role="menuitem"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>

                <div className="border-t border-border pt-5 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { onSearchOpen?.(); setMobileOpen(false); }}
                    className="w-full justify-start gap-3 h-11 text-base"
                  >
                    <Search className="h-4 w-4" /> Search
                  </Button>
                  
                  {!user ? (
                    <div className="space-y-2 pt-2">
                      <Button variant="outline" asChild className="w-full h-11 rounded-xl">
                        <Link to="/login" onClick={() => setMobileOpen(false)}>Log In</Link>
                      </Button>
                      <Button asChild className="w-full h-11 rounded-xl">
                        <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      {[
                        { to: "/profile", icon: <User className="h-4 w-4" />, label: "Profile" },
                        { to: "/my-bookings", icon: <CalendarCheck className="h-4 w-4" />, label: "My Bookings" },
                        { to: "/wishlist", icon: <Heart className="h-4 w-4" />, label: "Wishlist" },
                        { to: "/itineraries", icon: <MapIcon className="h-4 w-4" />, label: "Trip Planner" },
                        { to: "/host/dashboard", icon: <BarChart3 className="h-4 w-4" />, label: "Host Analytics" },
                        { to: "/host/bookings", icon: <Home className="h-4 w-4" />, label: "Host Bookings" },
                        { to: "/marketplace/my-shops", icon: <Store className="h-4 w-4" />, label: "My Shops" },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { handleSignOut(); setMobileOpen(false); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
