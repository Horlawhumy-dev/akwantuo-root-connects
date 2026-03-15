import { Destination } from "./types";
import { ghanaRegions } from "./regions";

export const destinations: Destination[] = [
  {
    id: "ghana",
    country: "Ghana",
    tagline: "The Gateway to Africa",
    description: "Ghana stands as the spiritual homecoming for millions in the African diaspora. From the slave castles of Cape Coast to the golden Ashanti Kingdom, from the vibrant streets of Accra to the serene savannahs of the North — Ghana offers the most complete cultural reconnection experience in West Africa.",
    tier: 1,
    image: "https://images.unsplash.com/photo-1580746738099-78d7c5a5019f?w=800",
    regions: ghanaRegions,
  },
  {
    id: "nigeria",
    country: "Nigeria",
    tagline: "Giant of Africa",
    description: "Nigeria's rich tapestry of over 250 ethnic groups, from the ancient Benin Kingdom to the Yoruba heartland of Ile-Ife, makes it a cultural powerhouse. Lagos pulses with Afrobeats energy while the North holds centuries of Islamic scholarship.",
    tier: 2,
    image: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=800",
    landmarks: ["Zuma Rock", "Osun-Osogbo Sacred Grove", "Lekki Conservation Centre", "Ancient Benin City Walls"],
  },
  {
    id: "togo",
    country: "Togo",
    tagline: "West Africa's Hidden Gem",
    description: "Togo offers a compact but culturally dense experience. The voodoo markets of Lomé, the UNESCO-listed Koutammakou landscape of the Batammariba, and the cascading waterfalls of Kpalimé make it an unforgettable destination.",
    tier: 2,
    image: "https://images.unsplash.com/photo-1504233529578-6d46baba6d34?w=800",
    landmarks: ["Koutammakou (Tamberma Valley)", "Lomé Grand Marché", "Fazao-Malfakassa National Park", "Togoville"],
  },
  {
    id: "benin",
    country: "Benin",
    tagline: "Birthplace of Voodoo",
    description: "The Kingdom of Dahomey, the birthplace of Vodun, and the historic slave route of Ouidah — Benin is where African spirituality and colonial history converge in the most profound way.",
    tier: 2,
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800",
    landmarks: ["Route des Esclaves (Ouidah)", "Royal Palaces of Abomey", "Ganvié Lake Village", "Pendjari National Park"],
  },
  {
    id: "cote-divoire",
    country: "Côte d'Ivoire",
    tagline: "Pearl of West Africa",
    description: "From the towering Basilica of Our Lady of Peace in Yamoussoukro to the bustling markets of Abidjan, Côte d'Ivoire blends French colonial elegance with deep Akan, Mandé, and Krou traditions.",
    tier: 2,
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
    landmarks: ["Basilica of Our Lady of Peace", "Grand-Bassam", "Taï National Park", "Comoé National Park"],
  },
];
