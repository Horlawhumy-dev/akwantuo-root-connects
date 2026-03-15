import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MapPin, BookOpen, Music, Shield } from "lucide-react";

interface SearchResult {
  title: string;
  subtitle: string;
  to: string;
  icon: React.ReactNode;
}

const staticResults: SearchResult[] = [
  { title: "Ghana", subtitle: "Explore all 16 regions", to: "/destinations/ghana", icon: <MapPin className="h-4 w-4" /> },
  { title: "Ashanti Region", subtitle: "Kumasi, Kente, Golden Stool", to: "/destinations/ghana/ashanti", icon: <MapPin className="h-4 w-4" /> },
  { title: "Greater Accra", subtitle: "Capital, Jamestown, Labadi", to: "/destinations/ghana/greater-accra", icon: <MapPin className="h-4 w-4" /> },
  { title: "Cape Coast Castle", subtitle: "History · Central Region", to: "/archive/cape-coast-castle", icon: <BookOpen className="h-4 w-4" /> },
  { title: "Homowo Festival", subtitle: "Festival · Greater Accra", to: "/festivals", icon: <Music className="h-4 w-4" /> },
  { title: "Panafest", subtitle: "Festival · Central Region", to: "/festivals", icon: <Music className="h-4 w-4" /> },
  { title: "Safety Map", subtitle: "Travel safety across Ghana", to: "/safety", icon: <Shield className="h-4 w-4" /> },
  { title: "Travel Essentials", subtitle: "Hospitals, transport & emergency contacts", to: "/travel-essentials", icon: <Shield className="h-4 w-4" /> },
  { title: "Events Calendar", subtitle: "Upcoming festivals & cultural events", to: "/events", icon: <Music className="h-4 w-4" /> },
];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Cmd+K listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const filtered = query
    ? staticResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : staticResults;

  const handleSelect = (to: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search destinations, archive, festivals…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {filtered.map((result) => (
            <CommandItem
              key={result.to + result.title}
              onSelect={() => handleSelect(result.to)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className="text-primary">{result.icon}</span>
              <div>
                <p className="text-sm font-medium">{result.title}</p>
                <p className="text-xs text-muted-foreground">{result.subtitle}</p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
