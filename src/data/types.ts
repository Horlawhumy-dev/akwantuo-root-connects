export interface Region {
  id: string;
  name: string;
  capital: string;
  description: string;
  highlights: string[];
  hiddenGems: string[];
  image: string;
}

export interface Destination {
  id: string;
  country: string;
  tagline: string;
  description: string;
  tier: 1 | 2;
  image: string;
  regions?: Region[];
  landmarks?: string[];
}

export interface ArchiveItem {
  id: string;
  title: string;
  category: "History" | "Culture" | "Cuisine" | "Traditions" | "Hidden Gems";
  region: string;
  country: string;
  summary: string;
  content: string;
  image: string;
}

export interface Festival {
  id: string;
  name: string;
  region: string;
  country: string;
  dates: string;
  description: string;
  image: string;
}

export interface SafetyZone {
  id: string;
  name: string;
  region: string;
  country: string;
  level: "safe" | "caution" | "restricted";
  description: string;
}

export interface Listing {
  id: string;
  name: string;
  type: "guest-house" | "boutique-hotel" | "homestay";
  region: string;
  country: string;
  price: number;
  rating: number;
  description: string;
  amenities: string[];
  image: string;
  available: boolean;
}
