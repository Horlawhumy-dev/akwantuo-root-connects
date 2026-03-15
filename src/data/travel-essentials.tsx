import React from "react";
import {
  Banknote, CreditCard, Smartphone, Globe, Droplets, UtensilsCrossed,
  Heart, HandshakeIcon, Camera, Bus, Car, Plane, Navigation,
  Sun, Thermometer, CloudRain, CloudSun,
} from "lucide-react";

export interface CountryEssentials {
  code: string;
  name: string;
  flag: string;
  currency: { code: string; symbol: string; name: string };
  emergencyContacts: { label: string; number: string; description: string }[];
  visaInfo: { title: string; content: string }[];
  currencyInfo: { icon: React.ReactNode; title: string; content: string }[];
  simGuide: { provider: string; color: string; details: string }[];
  simHow: string;
  wifiNote: string;
  packingExtras: string[];
  weatherSeasons: { season: string; months: string; icon: React.ReactNode; temp: string; description: string; best: boolean }[];
  etiquetteGuide: { icon: React.ReactNode; title: string; tips: string[] }[];
  foodSafetyGuide: { title: string; icon: React.ReactNode; content: string }[];
  gettingAroundGuide: { title: string; icon: React.ReactNode; content: string }[];
  insuranceTip: string;
  plugType: string;
}

export const countryEssentials: Record<string, CountryEssentials> = {
  ghana: {
    code: "ghana",
    name: "Ghana",
    flag: "🇬🇭",
    currency: { code: "GHS", symbol: "₵", name: "Ghana Cedi" },
    emergencyContacts: [
      { label: "Police", number: "191", description: "Ghana Police Service" },
      { label: "Fire Service", number: "192", description: "National Fire Service" },
      { label: "Ambulance", number: "193", description: "National Ambulance Service" },
      { label: "Toll-Free Emergency", number: "112", description: "Universal emergency line" },
      { label: "US Embassy Accra", number: "+233 30 274 1000", description: "American Citizens Services" },
      { label: "UK High Commission", number: "+233 30 221 3250", description: "British High Commission Accra" },
    ],
    visaInfo: [
      { title: "Visa on Arrival (African Union Passport)", content: "Holders of an African Union passport can enter Ghana visa-free. ECOWAS nationals do not need a visa." },
      { title: "US / UK / EU Citizens", content: "Require a visa before arrival. Apply through the Ghana Immigration Service portal or your nearest Ghana embassy. Single-entry tourist visa costs ~$60 USD, valid for 30 days with option to extend. Processing takes 5–10 business days." },
      { title: "Year of Return / Beyond the Return", content: "Diaspora travelers may qualify for the 'Right of Abode' through the Ghana Immigration Service, granting indefinite stay. Bring proof of African heritage (DNA test, ancestry documentation)." },
      { title: "Required Documents", content: "Valid passport (6+ months validity), completed visa application form, 2 passport photos, proof of accommodation, return flight ticket, yellow fever vaccination certificate, and proof of sufficient funds." },
      { title: "Yellow Fever Vaccination", content: "MANDATORY. You must present a valid International Certificate of Vaccination (yellow card) for yellow fever upon arrival. Get vaccinated at least 10 days before travel. The vaccine is valid for life." },
    ],
    currencyInfo: [
      { icon: <Banknote className="h-5 w-5" />, title: "Currency", content: "The Ghana Cedi (GHS / ₵). As of 2026, roughly 1 USD = 15–16 GHS. Denominations: ₵1, ₵2, ₵5, ₵10, ₵20, ₵50, ₵100, ₵200 notes." },
      { icon: <CreditCard className="h-5 w-5" />, title: "Cards & ATMs", content: "Visa and Mastercard are accepted at hotels, upscale restaurants, and supermarkets in Accra and Kumasi. ATMs (Ecobank, Stanbic, GCB) dispense cedis and are widespread in cities. Carry cash for markets, trotros, and rural areas." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Mobile Money (MoMo)", content: "MTN Mobile Money is the dominant payment system — used everywhere from street food to taxi rides. Get a local SIM and register for MoMo at any MTN shop with your passport. This is the most practical way to pay in Ghana." },
      { icon: <Globe className="h-5 w-5" />, title: "Exchange Tips", content: "Exchange at Forex bureaus (better rates than banks). Avoid street exchangers. Airport rates are poor — exchange only a small amount on arrival. US dollars and Euros are most easily exchanged. Bring crisp, newer bills." },
    ],
    simGuide: [
      { provider: "MTN Ghana", color: "bg-yellow-100 text-yellow-800", details: "Largest network, best coverage nationwide. Data bundles: 1GB ~₵5, 10GB ~₵30. Buy SIM at any MTN shop or airport. MoMo registration included." },
      { provider: "Vodafone Ghana", color: "bg-red-100 text-red-800", details: "Good urban coverage, popular with expats. Competitive data bundles. Free Wi-Fi hotspots at Vodafone Cafés." },
      { provider: "AirtelTigo", color: "bg-blue-100 text-blue-800", details: "Budget-friendly option. Good for voice calls. Coverage improving in rural areas." },
    ],
    simHow: "Purchase a SIM card at Kotoka International Airport arrivals (MTN & Vodafone counters) or any provider shop in the city. You'll need your passport and a Ghana Card or biometric registration (staff at the shop will assist). Registration takes 10–15 minutes. Top up with airtime scratch cards available everywhere.",
    wifiNote: "Hotels, cafés, and co-working spaces in Accra, Kumasi, and Cape Coast offer Wi-Fi. Speeds vary (5–25 Mbps typical). For reliable internet outside cities, tether your phone's mobile data. Download offline maps and essential content before heading to rural areas.",
    packingExtras: [],
    plugType: "UK Type G",
    weatherSeasons: [
      { season: "Dry Season (Harmattan)", months: "November – February", icon: <Sun className="h-5 w-5" />, temp: "24°C – 32°C", description: "Dusty, dry winds from the Sahara. Best for travel — clear skies, cooler evenings. Pack lip balm and moisturiser. Peak tourist season.", best: true },
      { season: "Hot & Dry", months: "March – April", icon: <Thermometer className="h-5 w-5" />, temp: "28°C – 36°C", description: "Hottest months, especially in the north. Hydrate constantly. Good for beach visits on the coast.", best: false },
      { season: "Major Rainy Season", months: "May – July", icon: <CloudRain className="h-5 w-5" />, temp: "24°C – 30°C", description: "Heavy afternoon showers, mostly in the south. Lush green landscapes, fewer tourists, lower prices. Pack waterproof layers.", best: false },
      { season: "Mini Dry Season", months: "August", icon: <CloudSun className="h-5 w-5" />, temp: "24°C – 29°C", description: "Brief respite from rain. Homowo and Chale Wote festivals in Accra. Great for cultural tourism.", best: true },
      { season: "Minor Rainy Season", months: "September – October", icon: <Droplets className="h-5 w-5" />, temp: "24°C – 30°C", description: "Lighter rains than May–July. Fewer tourists, good deals on accommodation. Many festivals.", best: false },
    ],
    etiquetteGuide: [
      { icon: <HandshakeIcon className="h-5 w-5" />, title: "Greetings", tips: ["Always greet elders first — 'Akwaaba' (welcome) is universal", "Handshakes are common; use the right hand", "In Ashanti areas, a slight bow to chiefs shows respect", "Address elders as 'Auntie' or 'Uncle' even if not related"] },
      { icon: <Heart className="h-5 w-5" />, title: "Dress & Modesty", tips: ["Dress modestly at palaces, shrines, and sacred groves", "Cover shoulders and knees at cultural/religious sites", "Remove shoes before entering a chief's palace", "Wearing all-black is reserved for funerals — avoid casually"] },
      { icon: <Camera className="h-5 w-5" />, title: "Photography Etiquette", tips: ["Always ask before photographing people", "Some sacred sites prohibit photography", "Fishermen at Elmina/Jamestown may request a small fee for photos", "Never photograph military or government installations"] },
      { icon: <Banknote className="h-5 w-5" />, title: "Tipping & Bargaining", tips: ["Tipping 10% at upscale restaurants is appreciated, not mandatory", "Hotel porters: ₵5–10 per bag", "Bargaining is expected at markets — start at 50% and meet in the middle", "Fixed prices at supermarkets and malls"] },
    ],
    foodSafetyGuide: [
      { title: "Water Safety", icon: <Droplets className="h-5 w-5" />, content: "Do NOT drink tap water. Buy sealed sachet water ('pure water', ₵0.50) or bottled water. Use bottled water for brushing teeth." },
      { title: "Must-Try Dishes", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Jollof Rice, Fufu with Light Soup, Banku with Tilapia, Waakye (rice & beans), Kelewele (spicy plantain), Red Red (bean stew), Kenkey with fish." },
      { title: "Street Food Tips", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Street food is generally safe if freshly cooked in front of you. Look for vendors with high turnover. Evening is prime street food time." },
      { title: "Dietary Notes", icon: <Heart className="h-5 w-5" />, content: "Vegetarian options: Red Red, plain rice, yam chips, garden egg stew. Gluten-free: fufu, banku, and rice dishes. Communicate allergies clearly." },
    ],
    gettingAroundGuide: [
      { title: "Trotros (Shared Minibuses)", icon: <Bus className="h-5 w-5" />, content: "The cheapest and most common transport. No set timetable — they leave when full. Pay the 'mate' (conductor). Fares: ₵2–15." },
      { title: "Uber & Bolt", icon: <Car className="h-5 w-5" />, content: "Available in Accra, Kumasi, and Takoradi. Affordable and convenient. Cash and card payments accepted." },
      { title: "Taxis", icon: <Car className="h-5 w-5" />, content: "Negotiate the fare BEFORE entering. There are no meters. Airport to central Accra: ₵80–120." },
      { title: "Domestic Flights", icon: <Plane className="h-5 w-5" />, content: "Africa World Airlines and PassionAir operate between Accra, Kumasi, Tamale, and Takoradi. 45–60 mins vs 5–8 hours by road." },
      { title: "Intercity Buses", icon: <Bus className="h-5 w-5" />, content: "VIP/VVIP buses (STC, VIP Jeoun) are comfortable with A/C. Book a day ahead. Accra–Kumasi: ~₵80–120, 4–5 hours." },
      { title: "Car Rental", icon: <Navigation className="h-5 w-5" />, content: "Available with or without a driver. Highly recommend hiring WITH a driver. ₵250–500/day with driver and fuel. Drive on the RIGHT side." },
    ],
    insuranceTip: "We strongly recommend purchasing comprehensive travel insurance before visiting Ghana. Most private hospitals require proof of insurance or upfront payment before providing treatment.",
  },

  nigeria: {
    code: "nigeria",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    emergencyContacts: [
      { label: "Police", number: "112", description: "Nigeria Police Force" },
      { label: "Fire Service", number: "112", description: "Federal Fire Service" },
      { label: "Ambulance (LASAMBUS)", number: "112", description: "Lagos State Ambulance" },
      { label: "NEMA", number: "+234 9 234 6165", description: "National Emergency Management Agency" },
      { label: "US Embassy Lagos", number: "+234 1 460 3400", description: "American Citizens Services" },
      { label: "UK High Commission", number: "+234 1 277 0780", description: "British High Commission Lagos" },
    ],
    visaInfo: [
      { title: "ECOWAS Nationals", content: "Citizens of ECOWAS member states can enter Nigeria visa-free with a valid travel document for up to 90 days." },
      { title: "US / UK / EU Citizens", content: "Require a visa before arrival. Apply through the Nigeria Immigration Service portal (portal.immigration.gov.ng). Tourist visa costs ~$180 USD for US citizens, processing 5–15 business days. eVisa available." },
      { title: "Visa on Arrival", content: "Available for citizens of eligible countries (African Union member states, and select others). Apply online at least 48 hours before travel. Costs $20–100 depending on nationality." },
      { title: "Required Documents", content: "Valid passport (6+ months validity), visa application, 2 passport photos, proof of accommodation, return flight ticket, yellow fever certificate, proof of sufficient funds, and invitation letter (for some visa types)." },
      { title: "Yellow Fever Vaccination", content: "MANDATORY. You must present a valid International Certificate of Vaccination for yellow fever upon arrival. No exceptions." },
    ],
    currencyInfo: [
      { icon: <Banknote className="h-5 w-5" />, title: "Currency", content: "The Nigerian Naira (NGN / ₦). As of 2026, roughly 1 USD = 1,500–1,600 NGN. Notes: ₦5, ₦10, ₦20, ₦50, ₦100, ₦200, ₦500, ₦1,000. The ₦200 and above are most used." },
      { icon: <CreditCard className="h-5 w-5" />, title: "Cards & ATMs", content: "Visa and Mastercard accepted at hotels, malls, and restaurants in Lagos and Abuja. ATMs (First Bank, GTBank, Zenith) are widespread in cities. Daily withdrawal limits apply (~₦100,000–200,000)." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Mobile Money & Transfers", content: "Opay, Palmpay, and bank apps (GTBank *737#, Access USSD) are widely used. POS terminals are everywhere in Lagos. Transfers via apps are the most common payment method among locals." },
      { icon: <Globe className="h-5 w-5" />, title: "Exchange Tips", content: "Exchange at licensed Bureau de Change (BDC) offices. Avoid street 'Aboki' exchangers. The parallel market rate differs significantly from the official rate. US dollars are king — bring crisp, newer $100 bills." },
    ],
    simGuide: [
      { provider: "MTN Nigeria", color: "bg-yellow-100 text-yellow-800", details: "Largest network, best coverage nationwide. Data: 1GB ~₦500, 10GB ~₦3,000. Buy at MTN shops or airport. NIN required for registration." },
      { provider: "Airtel Nigeria", color: "bg-red-100 text-red-800", details: "Strong urban coverage, competitive data prices. Popular for its affordable data bundles. Good 4G in Lagos and Abuja." },
      { provider: "Glo (Globacom)", color: "bg-green-100 text-green-800", details: "Nigerian-owned, affordable data plans. Known for generous data bonuses. Coverage improving in rural areas." },
    ],
    simHow: "Purchase a SIM at Murtala Muhammed Airport (Lagos) or Nnamdi Azikiwe Airport (Abuja). You'll need your passport and NIN (National Identification Number) — as a tourist, the vendor can register using a temporary process. Takes 15–30 minutes.",
    wifiNote: "Hotels and co-working spaces in Lagos, Abuja, and Port Harcourt offer Wi-Fi. Speeds range from 5–50 Mbps. Lagos has the best connectivity. Mobile data (4G) is the most reliable option across the country.",
    packingExtras: ["NIN registration patience", "Cash in small denominations"],
    plugType: "UK Type G",
    weatherSeasons: [
      { season: "Dry Season (Harmattan)", months: "November – February", icon: <Sun className="h-5 w-5" />, temp: "25°C – 35°C", description: "Dry, dusty winds from the Sahara. Best for travel in the south. Cool evenings in the north. Peak festival season.", best: true },
      { season: "Hot Season", months: "March – April", icon: <Thermometer className="h-5 w-5" />, temp: "30°C – 40°C", description: "Very hot, especially in the north. Hydrate constantly. Good for Lagos beach activities.", best: false },
      { season: "Rainy Season", months: "May – October", icon: <CloudRain className="h-5 w-5" />, temp: "24°C – 32°C", description: "Heavy rains, especially May–July. August has a brief dry spell ('August break'). Lush green landscapes.", best: false },
      { season: "August Break", months: "August", icon: <CloudSun className="h-5 w-5" />, temp: "25°C – 30°C", description: "Brief dry spell in the south. Good for travel. Reduced rainfall makes roads more passable.", best: true },
    ],
    etiquetteGuide: [
      { icon: <HandshakeIcon className="h-5 w-5" />, title: "Greetings", tips: ["Greetings are extremely important — always say hello first", "Prostrate or kneel when greeting Yoruba elders (depending on gender)", "Use titles: 'Oga' (sir/boss), 'Madam', 'Chief'", "In the north, 'Sannu' (Hausa greeting) goes a long way"] },
      { icon: <Heart className="h-5 w-5" />, title: "Dress & Modesty", tips: ["Dress modestly in the north (Muslim regions) — cover shoulders and knees", "Agbada and native attire are appreciated at events and churches", "Remove shoes before entering mosques", "Owambe (party) culture means dressing up is expected at celebrations"] },
      { icon: <Camera className="h-5 w-5" />, title: "Photography", tips: ["Ask permission before photographing people", "Photography is restricted at military installations and government buildings", "Some markets (especially in the north) may be sensitive to cameras", "Lagos street photographers are generally friendly"] },
      { icon: <Banknote className="h-5 w-5" />, title: "Tipping & Bargaining", tips: ["Tip 10% at restaurants if no service charge is included", "Hotel staff, drivers: ₦500–₦2,000 depending on service", "Bargaining is essential at markets — start at 30–40% of asking price", "Fixed prices at malls and supermarkets"] },
    ],
    foodSafetyGuide: [
      { title: "Water Safety", icon: <Droplets className="h-5 w-5" />, content: "Do NOT drink tap water. Buy sealed 'pure water' sachets (₦20–50) or bottled water (Eva, Nestle). Use bottled water for brushing teeth in budget accommodations." },
      { title: "Must-Try Dishes", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Jollof Rice (the BEST, don't tell Ghana 😄), Pounded Yam with Egusi Soup, Suya (spiced grilled meat), Pepper Soup, Amala with Ewedu, Ofada Rice, Bole (roasted plantain)." },
      { title: "Street Food Tips", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Suya spots (evening vendors) are a must. Try roasted corn and ube (African pear) in season. 'Mama Put' restaurants offer affordable, freshly cooked local food." },
      { title: "Dietary Notes", icon: <Heart className="h-5 w-5" />, content: "Vegetarian can be challenging but options exist: moin-moin, fried plantain, beans, vegetable soups. Northern cuisine uses more grains. Communicate allergies clearly." },
    ],
    gettingAroundGuide: [
      { title: "Danfo / Keke (Shared Transport)", icon: <Bus className="h-5 w-5" />, content: "Yellow danfo buses and keke (tricycles) are the cheapest way around Lagos. Chaotic but authentic. Fares: ₦100–500 within Lagos." },
      { title: "Uber, Bolt & InDrive", icon: <Car className="h-5 w-5" />, content: "Available in Lagos, Abuja, and Port Harcourt. Most reliable transport option for visitors. Cash and card accepted. Use InDrive to negotiate fares." },
      { title: "BRT (Lagos Bus Rapid Transit)", icon: <Bus className="h-5 w-5" />, content: "Air-conditioned buses with dedicated lanes. Covers major Lagos routes. Cowry Card needed — buy at BRT terminals. Fares from ₦200." },
      { title: "Domestic Flights", icon: <Plane className="h-5 w-5" />, content: "Air Peace, Ibom Air, and United Nigeria Airlines connect Lagos, Abuja, Port Harcourt, Calabar, Enugu. Flights: 1 hour vs 10+ hours by road. From ₦30,000 one way." },
      { title: "Intercity Buses", icon: <Bus className="h-5 w-5" />, content: "God is Good Motors, ABC Transport, and Chisco run comfortable intercity routes. Lagos–Abuja: ₦15,000–25,000, 8–10 hours. Book online or at terminals." },
      { title: "Car Rental", icon: <Navigation className="h-5 w-5" />, content: "Available with driver (strongly recommended in Lagos). ₦30,000–80,000/day with driver and fuel. Lagos traffic requires local expertise. Drive on the RIGHT." },
    ],
    insuranceTip: "Travel insurance is strongly recommended. Private hospitals in Lagos (e.g., Reddington, Lagoon Hospital) are world-class but expensive. Carry insurance documents at all times.",
  },

  senegal: {
    code: "senegal",
    name: "Senegal",
    flag: "🇸🇳",
    currency: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
    emergencyContacts: [
      { label: "Police", number: "17", description: "Senegalese Police" },
      { label: "Fire / Ambulance", number: "18", description: "Sapeurs-Pompiers" },
      { label: "Gendarmerie", number: "800 00 20 20", description: "National Gendarmerie" },
      { label: "US Embassy Dakar", number: "+221 33 879 4000", description: "American Citizens Services" },
      { label: "French Embassy", number: "+221 33 839 5100", description: "Ambassade de France" },
    ],
    visaInfo: [
      { title: "ECOWAS Nationals", content: "ECOWAS citizens can enter Senegal visa-free with a valid travel document." },
      { title: "US / UK / EU Citizens", content: "US, UK, and most EU citizens do NOT need a visa for stays up to 90 days. Simply present your passport (6+ months validity) and proof of return travel." },
      { title: "Other Nationalities", content: "Some nationalities require a visa — check with the nearest Senegalese embassy. eVisa may be available through the Senegal immigration portal." },
      { title: "Required Documents", content: "Valid passport (6+ months), proof of accommodation, return ticket, yellow fever certificate. No visa fee for eligible nationalities." },
      { title: "Yellow Fever Vaccination", content: "MANDATORY. Present your International Certificate of Vaccination upon arrival. Required for all travelers over 1 year old." },
    ],
    currencyInfo: [
      { icon: <Banknote className="h-5 w-5" />, title: "Currency", content: "The West African CFA Franc (XOF). Pegged to the Euro: 1 EUR = 655.957 XOF. Roughly 1 USD = 600–620 XOF. Notes: 500, 1000, 2000, 5000, 10000 CFA." },
      { icon: <CreditCard className="h-5 w-5" />, title: "Cards & ATMs", content: "ATMs available in Dakar (SGBS, BICIS, Ecobank). Visa more accepted than Mastercard. Most places outside Dakar are cash-only. Withdraw enough before traveling upcountry." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Mobile Money", content: "Orange Money and Wave are widely used. Wave is especially popular for quick payments. Register at any Orange or Wave kiosk with your passport." },
      { icon: <Globe className="h-5 w-5" />, title: "Exchange Tips", content: "Exchange Euros for the best rates (CFA is pegged to EUR). Forex bureaux in Dakar offer fair rates. Bring Euros rather than USD if possible." },
    ],
    simGuide: [
      { provider: "Orange Senegal", color: "bg-orange-100 text-orange-800", details: "Dominant network, best coverage. Data: 1GB ~500 CFA, 5GB ~2,000 CFA. Airport SIM counters available. Orange Money included." },
      { provider: "Free (Tigo)", color: "bg-blue-100 text-blue-800", details: "Competitive pricing, good urban coverage. Popular for affordable data bundles. Growing 4G network." },
      { provider: "Expresso", color: "bg-green-100 text-green-800", details: "Smaller network but budget-friendly. Good for voice calls. Limited rural coverage." },
    ],
    simHow: "Purchase a SIM at Blaise Diagne International Airport or any provider shop in Dakar. Passport required for registration. Quick and straightforward — 10 minutes. Top up at any small shop or street vendor.",
    wifiNote: "Hotels, restaurants, and cafés in Dakar and Saint-Louis offer Wi-Fi. Speeds: 5–20 Mbps. Outside major cities, rely on mobile data. Download offline maps for rural travel.",
    packingExtras: ["French phrasebook or translation app", "Modest clothing for mosque visits"],
    plugType: "European Type C/E",
    weatherSeasons: [
      { season: "Dry Season (Cool)", months: "November – February", icon: <Sun className="h-5 w-5" />, temp: "18°C – 30°C", description: "Best time to visit. Pleasant temperatures, no rain. Ideal for Dakar, Saint-Louis, and cultural festivals.", best: true },
      { season: "Dry Season (Hot)", months: "March – May", icon: <Thermometer className="h-5 w-5" />, temp: "25°C – 40°C", description: "Hot and dry, especially inland. Dakar stays milder due to ocean breeze. Stay hydrated.", best: false },
      { season: "Rainy Season (Hivernage)", months: "June – October", icon: <CloudRain className="h-5 w-5" />, temp: "25°C – 33°C", description: "Heavy rains, especially August–September. Lush green landscapes. Some roads become impassable. Fewer tourists.", best: false },
    ],
    etiquetteGuide: [
      { icon: <HandshakeIcon className="h-5 w-5" />, title: "Greetings (Teranga)", tips: ["Senegal is the 'Land of Teranga' (hospitality) — greetings are sacred", "'Nanga def?' (How are you? in Wolof) will earn instant smiles", "Lengthy greetings asking about family are expected — never rush", "Handshake with the right hand; left hand touching right forearm shows extra respect"] },
      { icon: <Heart className="h-5 w-5" />, title: "Dress & Modesty", tips: ["Senegal is predominantly Muslim — dress modestly outside beach areas", "Cover shoulders and knees when visiting mosques or villages", "Boubou (flowing robe) is traditional attire — wearing one shows cultural appreciation", "Women should carry a light scarf for mosque visits"] },
      { icon: <Camera className="h-5 w-5" />, title: "Photography", tips: ["Always ask permission before photographing people, especially in rural areas", "Some communities believe photos can capture the soul — respect refusals", "The Pink Lake (Lac Rose) and Gorée Island are photography-friendly", "Avoid photographing military or government buildings"] },
      { icon: <Banknote className="h-5 w-5" />, title: "Tipping & Bargaining", tips: ["Tipping 5–10% at restaurants is appreciated", "Round up taxi fares as a courtesy", "Bargaining is expected at Sandaga Market and Soumbédioune — start at 40%", "Fixed prices at supermarkets (Casino, Auchan)"] },
    ],
    foodSafetyGuide: [
      { title: "Water Safety", icon: <Droplets className="h-5 w-5" />, content: "Tap water in Dakar is generally treated but buy bottled water to be safe. In rural areas, always drink bottled or filtered water." },
      { title: "Must-Try Dishes", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Thiéboudienne (national dish — fish & rice), Yassa Poulet (chicken in onion-lemon sauce), Mafé (peanut stew), Thiéré (couscous), Pastels (fried fish empanadas)." },
      { title: "Street Food Tips", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Try fataya (meat pastries) and dibi (grilled lamb) at evening street stands. Tangana (breakfast cafés) serve bread, chocolate spread, and Nescafé. Eat where locals eat." },
      { title: "Dietary Notes", icon: <Heart className="h-5 w-5" />, content: "Vegetarian options: thiéré with vegetables, salads, bean dishes. Fish is a staple so pescatarian-friendly. Communicate allergies in French for better understanding." },
    ],
    gettingAroundGuide: [
      { title: "Car Rapides & Ndiaga Ndiaye", icon: <Bus className="h-5 w-5" />, content: "Colorful minibuses are the cheapest way around Dakar. Ndiaga Ndiaye are larger and more comfortable. Fares: 150–300 CFA within Dakar." },
      { title: "Taxis", icon: <Car className="h-5 w-5" />, content: "Yellow taxis in Dakar — negotiate before entering. Airport to city centre: 10,000–15,000 CFA. Short trips: 1,500–3,000 CFA. No meters." },
      { title: "Dakar Dem Dikk (BRT)", icon: <Bus className="h-5 w-5" />, content: "Air-conditioned public buses covering major Dakar routes. Clean and affordable (150–500 CFA). The new BRT line is efficient." },
      { title: "TER Train", icon: <Navigation className="h-5 w-5" />, content: "New express train connecting Dakar to Blaise Diagne Airport (AIBD) in 45 minutes. Clean, fast, and affordable (1,500 CFA)." },
      { title: "Sept-Places (Bush Taxis)", icon: <Car className="h-5 w-5" />, content: "7-seater shared taxis for intercity travel. Dakar–Saint-Louis: 5,000–7,000 CFA, 4–5 hours. Leave when full from designated gare routière." },
      { title: "Domestic Flights", icon: <Plane className="h-5 w-5" />, content: "Air Senegal connects Dakar to Ziguinchor (Casamance) and Cap Skirring. 45-min flight vs 12+ hours by road. Essential for Casamance." },
    ],
    insuranceTip: "Travel insurance recommended. Hôpital Principal in Dakar offers good care but is expensive. Clinics in Dakar are reliable for minor issues.",
  },

  benin: {
    code: "benin",
    name: "Benin",
    flag: "🇧🇯",
    currency: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
    emergencyContacts: [
      { label: "Police", number: "117", description: "Police Nationale" },
      { label: "Fire / Ambulance", number: "118", description: "Sapeurs-Pompiers" },
      { label: "SAMU (Medical)", number: "112", description: "Service d'Aide Médicale Urgente" },
      { label: "US Embassy Cotonou", number: "+229 21 30 0650", description: "American Citizens Services" },
      { label: "French Embassy", number: "+229 21 36 5555", description: "Ambassade de France" },
    ],
    visaInfo: [
      { title: "ECOWAS Nationals", content: "ECOWAS citizens can enter Benin visa-free with a valid travel document for up to 90 days." },
      { title: "eVisa (All Other Nationalities)", content: "Benin requires an eVisa for most non-ECOWAS travelers. Apply online at evisa.gouv.bj. Single entry (30 days): $50, Multiple entry (90 days): $100. Processing: 48–72 hours." },
      { title: "Required Documents", content: "Valid passport (6+ months), eVisa confirmation, proof of accommodation, return ticket, yellow fever certificate, proof of sufficient funds." },
      { title: "Yellow Fever Vaccination", content: "MANDATORY. International Certificate of Vaccination required at entry. Strict enforcement — you may be denied boarding without it." },
    ],
    currencyInfo: [
      { icon: <Banknote className="h-5 w-5" />, title: "Currency", content: "West African CFA Franc (XOF), same as Senegal, Togo, Côte d'Ivoire, and Mali. Pegged to Euro: 1 EUR = 655.957 XOF. Roughly 1 USD = 600–620 XOF." },
      { icon: <CreditCard className="h-5 w-5" />, title: "Cards & ATMs", content: "ATMs available in Cotonou and Porto-Novo (Ecobank, BOA). Very limited outside major cities. Visa is more accepted than Mastercard. Carry plenty of cash." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Mobile Money", content: "MTN MoMo and Moov Money are widely used. Essential for daily transactions. Register at any agent with your passport." },
      { icon: <Globe className="h-5 w-5" />, title: "Exchange Tips", content: "Bring Euros for best rates. Forex bureaux in Cotonou. Nigerian Naira is also accepted near the border. Avoid street exchangers." },
    ],
    simGuide: [
      { provider: "MTN Benin", color: "bg-yellow-100 text-yellow-800", details: "Largest network, best coverage. Data: 1GB ~500 CFA. Airport SIM available. MoMo registration included." },
      { provider: "Moov Africa", color: "bg-blue-100 text-blue-800", details: "Second-largest network. Competitive data bundles. Good coverage in Cotonou and major towns." },
    ],
    simHow: "Buy a SIM at Cadjèhoun Airport or any provider shop in Cotonou. Passport required. Registration takes 10–15 minutes. Airtime available at street vendors everywhere.",
    wifiNote: "Hotels in Cotonou offer Wi-Fi. Speeds are modest (3–10 Mbps). Outside Cotonou, rely on mobile data. Coverage is limited in northern Benin.",
    packingExtras: ["French phrasebook", "Cash in CFA and Euros"],
    plugType: "European Type C/E",
    weatherSeasons: [
      { season: "Dry Season (South)", months: "November – March", icon: <Sun className="h-5 w-5" />, temp: "25°C – 34°C", description: "Best time to visit. Ideal for Ouidah, Cotonou, and Ganvié. Voodoo Festival in January.", best: true },
      { season: "Long Rains (South)", months: "April – July", icon: <CloudRain className="h-5 w-5" />, temp: "24°C – 31°C", description: "Heavy rains in the south. Roads can flood. Lush landscapes.", best: false },
      { season: "Short Dry (South)", months: "August – September", icon: <CloudSun className="h-5 w-5" />, temp: "24°C – 29°C", description: "Brief respite from rain. Good for travel. Less crowded.", best: true },
      { season: "Short Rains / North Dry", months: "October", icon: <CloudRain className="h-5 w-5" />, temp: "24°C – 32°C", description: "Light rains in the south. Northern Benin starts its dry season — good for Pendjari National Park.", best: false },
    ],
    etiquetteGuide: [
      { icon: <HandshakeIcon className="h-5 w-5" />, title: "Greetings", tips: ["Greetings are very important — always greet before any interaction", "French is the official language: 'Bonjour' for hello", "In Fon areas, 'A do gangi' is a respectful greeting", "Handshakes with the right hand are standard"] },
      { icon: <Heart className="h-5 w-5" />, title: "Dress & Voodoo Sites", tips: ["Dress modestly when visiting voodoo temples and sacred forests", "Ask permission before entering sacred groves", "Respect voodoo ceremonies — they are deeply spiritual, not entertainment", "Remove shoes when asked at religious or cultural sites"] },
      { icon: <Camera className="h-5 w-5" />, title: "Photography", tips: ["Ask permission before photographing people and voodoo sites", "Some fetish markets prohibit photography — respect signs", "Ganvié stilt village residents may request a fee for photos", "Beautiful colonial architecture in Porto-Novo is photo-friendly"] },
      { icon: <Banknote className="h-5 w-5" />, title: "Tipping & Bargaining", tips: ["Tip 5–10% at restaurants", "Guides at Ouidah expect 2,000–5,000 CFA", "Bargaining is expected at Dantokpa Market (one of West Africa's largest)", "Fixed prices at supermarkets"] },
    ],
    foodSafetyGuide: [
      { title: "Water Safety", icon: <Droplets className="h-5 w-5" />, content: "Do NOT drink tap water. Buy bottled water (Possotomé brand is local). Sachet water is available. Use bottled water for brushing teeth." },
      { title: "Must-Try Dishes", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Pâte Rouge (corn dough with tomato sauce), Akassa with crab sauce, Amiwo (corn porridge), Tchoukoutou (millet beer), Grilled fish on the beach." },
      { title: "Street Food Tips", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Try akara (bean fritters), fried yam with pepper sauce, and brochettes (grilled meat skewers). Cotonou beach area has great evening food stalls." },
      { title: "Dietary Notes", icon: <Heart className="h-5 w-5" />, content: "Vegetarian options: bean dishes, fried plantain, vegetable sauces with pâte. Communicate allergies in French." },
    ],
    gettingAroundGuide: [
      { title: "Zémidjans (Motorcycle Taxis)", icon: <Car className="h-5 w-5" />, content: "The most common transport in Benin. Affordable and fast. Negotiate fare first. Cotonou rides: 200–1,000 CFA. Hold on tight!" },
      { title: "Taxis", icon: <Car className="h-5 w-5" />, content: "Shared taxis run fixed routes in Cotonou. Private taxis: negotiate fare. Airport to city: 5,000–10,000 CFA." },
      { title: "Bush Taxis", icon: <Car className="h-5 w-5" />, content: "Shared minibuses for intercity travel. Cotonou–Ouidah: 1,000 CFA, 1 hour. Cotonou–Natitingou: 8,000–10,000 CFA, 8 hours." },
      { title: "Car Rental", icon: <Navigation className="h-5 w-5" />, content: "Available with driver in Cotonou. 30,000–50,000 CFA/day. Recommended for multi-city trips and northern Benin." },
    ],
    insuranceTip: "Travel insurance strongly recommended. Medical facilities in Cotonou are basic. For serious conditions, evacuation to Accra or Europe may be necessary.",
  },

  togo: {
    code: "togo",
    name: "Togo",
    flag: "🇹🇬",
    currency: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
    emergencyContacts: [
      { label: "Police", number: "117", description: "Police Nationale du Togo" },
      { label: "Fire / Ambulance", number: "118", description: "Sapeurs-Pompiers" },
      { label: "Gendarmerie", number: "172", description: "National Gendarmerie" },
      { label: "US Embassy Lomé", number: "+228 22 61 5470", description: "American Citizens Services" },
      { label: "French Embassy", number: "+228 22 23 4640", description: "Ambassade de France" },
    ],
    visaInfo: [
      { title: "ECOWAS Nationals", content: "ECOWAS citizens can enter Togo visa-free for up to 90 days." },
      { title: "Visa on Arrival", content: "Available for most nationalities at Lomé-Tokoin Airport and land borders. Cost: 10,000 CFA (~$15) for 7 days. Extendable at immigration in Lomé." },
      { title: "eVisa", content: "Apply online at voyage.gouv.tg for longer stays. Single entry (30 days): approximately $50. Processing: 48 hours." },
      { title: "Required Documents", content: "Valid passport (6+ months), proof of accommodation, return ticket, yellow fever certificate, 2 passport photos, proof of funds." },
      { title: "Yellow Fever Vaccination", content: "MANDATORY. Strictly enforced at all entry points." },
    ],
    currencyInfo: [
      { icon: <Banknote className="h-5 w-5" />, title: "Currency", content: "West African CFA Franc (XOF), shared with Senegal, Benin, Côte d'Ivoire, and Mali. Pegged to Euro. 1 USD ≈ 600–620 XOF." },
      { icon: <CreditCard className="h-5 w-5" />, title: "Cards & ATMs", content: "ATMs in Lomé (Ecobank, Orabank, UTB). Very limited elsewhere. Carry cash for everything outside Lomé." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Mobile Money", content: "Flooz (Moov) and T-Money (Togocom) are widely used. Essential for daily payments. Register at any agent kiosk." },
      { icon: <Globe className="h-5 w-5" />, title: "Exchange Tips", content: "Euros preferred. Forex bureaux on Boulevard du 13 Janvier in Lomé. Some vendors near the Ghana border accept Ghana Cedis." },
    ],
    simGuide: [
      { provider: "Togocom", color: "bg-blue-100 text-blue-800", details: "State-backed, good coverage. T-Money for mobile payments. Data: 1GB ~500 CFA. Airport and city shops." },
      { provider: "Moov Africa Togo", color: "bg-purple-100 text-purple-800", details: "Good coverage in Lomé and major towns. Flooz mobile money. Competitive data bundles." },
    ],
    simHow: "Buy a SIM at Lomé-Tokoin Airport or any Togocom/Moov shop. Passport required. Registration is quick (~10 minutes). Airtime sold everywhere.",
    wifiNote: "Hotels and restaurants in Lomé offer Wi-Fi (3–15 Mbps). Very limited outside the capital. Mobile data is your best bet for connectivity.",
    packingExtras: ["French phrasebook", "Mosquito net (rural stays)"],
    plugType: "European Type C/E",
    weatherSeasons: [
      { season: "Dry Season", months: "November – February", icon: <Sun className="h-5 w-5" />, temp: "24°C – 34°C", description: "Best time to visit. Harmattan winds bring dry, hazy conditions. Ideal for Lomé, Kpalimé, and Kara.", best: true },
      { season: "Short Rains", months: "March – May", icon: <CloudRain className="h-5 w-5" />, temp: "25°C – 33°C", description: "Moderate rainfall in the south. Still manageable for travel. Good for lush mountain scenery.", best: false },
      { season: "Long Rains", months: "June – October", icon: <CloudRain className="h-5 w-5" />, temp: "23°C – 30°C", description: "Heavy rains, especially in the south. August has a brief dry spell. Northern Togo gets one rainy season (June–October).", best: false },
    ],
    etiquetteGuide: [
      { icon: <HandshakeIcon className="h-5 w-5" />, title: "Greetings", tips: ["Always greet people — it's considered rude not to", "French: 'Bonjour', Ewe: 'Ɛfoa', Kabyè: 'Laafi'", "Handshake with the right hand is standard", "Greet elders and chiefs before others in any gathering"] },
      { icon: <Heart className="h-5 w-5" />, title: "Dress & Culture", tips: ["Dress modestly, especially in the north and at voodoo sites", "Traditional pagne (cloth wrap) is appreciated at ceremonies", "Remove shoes at sacred sites and some homes", "Respect voodoo traditions — they are deeply held spiritual practices"] },
      { icon: <Camera className="h-5 w-5" />, title: "Photography", tips: ["Ask permission before photographing, especially at fetish markets", "Lomé's Grand Marché is generally photo-friendly", "Some Evala wrestling events may restrict photography", "Avoid photographing military installations"] },
      { icon: <Banknote className="h-5 w-5" />, title: "Tipping & Bargaining", tips: ["Small tips (500–1,000 CFA) appreciated at restaurants", "Bargaining expected at markets — friendly and expected", "Grand Marché in Lomé is the main shopping hub", "Fixed prices at supermarkets only"] },
    ],
    foodSafetyGuide: [
      { title: "Water Safety", icon: <Droplets className="h-5 w-5" />, content: "Don't drink tap water. Buy bottled or sachet water. Popular brands: Voltic, Ayo. Use bottled water for teeth brushing." },
      { title: "Must-Try Dishes", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Fufu with palm nut soup, Koklo Meme (grilled chicken), Akoumé (corn paste with sauce), Dékounou (corn cake), Grilled tilapia with piment." },
      { title: "Street Food Tips", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Try brochettes (meat skewers), fried yam, and bean cakes near Grand Marché. Evening food stalls along the beach road in Lomé are excellent." },
      { title: "Dietary Notes", icon: <Heart className="h-5 w-5" />, content: "Vegetarian: bean dishes, fried plantain, vegetable sauces. Fish is widely available. Communicate dietary needs in French." },
    ],
    gettingAroundGuide: [
      { title: "Zémidjans (Motorcycle Taxis)", icon: <Car className="h-5 w-5" />, content: "Ubiquitous and the fastest way around cities. Negotiate fare first. Lomé rides: 200–500 CFA. Helmets sometimes provided." },
      { title: "Shared Taxis", icon: <Car className="h-5 w-5" />, content: "Run fixed routes in Lomé and between cities. Cheap: 200–500 CFA within Lomé. Flag down on the roadside." },
      { title: "Bush Taxis / Minibuses", icon: <Bus className="h-5 w-5" />, content: "For intercity travel. Lomé–Kpalimé: 2,000 CFA, 2 hours. Lomé–Kara: 5,000–7,000 CFA, 6 hours. Leave when full." },
      { title: "Car Rental", icon: <Navigation className="h-5 w-5" />, content: "Available with driver in Lomé. 25,000–40,000 CFA/day. Recommended for exploring Mount Agou and Koutammakou." },
    ],
    insuranceTip: "Travel insurance strongly recommended. Medical facilities are basic outside Lomé. CHU Sylvanus Olympio in Lomé is the main hospital. Serious cases may require evacuation.",
  },

  "cote-divoire": {
    code: "cote-divoire",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    currency: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
    emergencyContacts: [
      { label: "Police", number: "110", description: "Police Nationale" },
      { label: "Fire / Ambulance", number: "180", description: "Sapeurs-Pompiers" },
      { label: "SAMU", number: "185", description: "Medical Emergency Service" },
      { label: "Gendarmerie", number: "111", description: "National Gendarmerie" },
      { label: "US Embassy Abidjan", number: "+225 27 22 49 4000", description: "American Citizens Services" },
      { label: "French Embassy", number: "+225 27 20 20 0404", description: "Ambassade de France" },
    ],
    visaInfo: [
      { title: "ECOWAS Nationals", content: "ECOWAS citizens can enter Côte d'Ivoire visa-free for up to 90 days." },
      { title: "eVisa (Most Nationalities)", content: "Apply online at snedai.com. Single entry (90 days): €73. Multiple entry: €113. Processing: 48–72 hours. Required for US, UK, EU citizens." },
      { title: "Required Documents", content: "Valid passport (6+ months), eVisa printout, proof of accommodation, return ticket, yellow fever certificate, proof of sufficient funds." },
      { title: "Yellow Fever Vaccination", content: "MANDATORY. Strictly enforced. International Certificate of Vaccination must be presented at entry." },
    ],
    currencyInfo: [
      { icon: <Banknote className="h-5 w-5" />, title: "Currency", content: "West African CFA Franc (XOF). 1 EUR = 655.957 XOF (fixed). 1 USD ≈ 600–620 XOF. Denominations: 500, 1,000, 2,000, 5,000, 10,000 CFA." },
      { icon: <CreditCard className="h-5 w-5" />, title: "Cards & ATMs", content: "ATMs widespread in Abidjan (SGCI, BICICI, Ecobank). Visa accepted at hotels and malls. Limited outside Abidjan and Bouaké. Always carry cash." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Mobile Money", content: "Orange Money and MTN MoMo are dominant. Wave is growing fast. Essential for daily transactions — from food to transport. Register at any kiosk." },
      { icon: <Globe className="h-5 w-5" />, title: "Exchange Tips", content: "Bring Euros for the best rates. Forex bureaux in Abidjan (Plateau district). Avoid street changers. Airport exchange is acceptable." },
    ],
    simGuide: [
      { provider: "Orange CI", color: "bg-orange-100 text-orange-800", details: "Dominant network. Best 4G coverage. Data: 1GB ~500 CFA. Orange Money included. Airport and city shops." },
      { provider: "MTN CI", color: "bg-yellow-100 text-yellow-800", details: "Strong coverage. MoMo mobile money. Competitive data bundles. Good in Abidjan and major cities." },
      { provider: "Moov Africa CI", color: "bg-blue-100 text-blue-800", details: "Budget-friendly option. Decent urban coverage. Moov Money for payments." },
    ],
    simHow: "Buy a SIM at Félix Houphouët-Boigny Airport or any provider shop. Passport and sometimes a local contact number required. Registration: 10–15 minutes.",
    wifiNote: "Good Wi-Fi in Abidjan hotels, cafés (Cap Nord, Abidjan Mall). Speeds: 5–30 Mbps. Outside Abidjan, rely on mobile data. 4G coverage is strong in major cities.",
    packingExtras: ["French phrasebook", "Business cards (networking culture)"],
    plugType: "European Type C/E",
    weatherSeasons: [
      { season: "Dry Season", months: "November – March", icon: <Sun className="h-5 w-5" />, temp: "25°C – 33°C", description: "Best time to visit. Ideal for Abidjan, Grand-Bassam, and western regions. December is peak season.", best: true },
      { season: "Long Rains", months: "April – July", icon: <CloudRain className="h-5 w-5" />, temp: "24°C – 30°C", description: "Heavy rains in the south. Green landscapes. Fewer tourists. Some roads become difficult.", best: false },
      { season: "Short Dry", months: "August – September", icon: <CloudSun className="h-5 w-5" />, temp: "24°C – 28°C", description: "Brief dry period. Good for travel. FEMUA music festival often falls in this period.", best: true },
      { season: "Short Rains", months: "October – November", icon: <CloudRain className="h-5 w-5" />, temp: "24°C – 31°C", description: "Lighter rains. Transition to dry season. Good deals on accommodation.", best: false },
    ],
    etiquetteGuide: [
      { icon: <HandshakeIcon className="h-5 w-5" />, title: "Greetings", tips: ["Always greet — 'Bonjour' is essential before any conversation", "Handshakes are common and warm", "Use 'Monsieur' or 'Madame' to show respect", "In Baoulé areas, clapping hands is a form of greeting"] },
      { icon: <Heart className="h-5 w-5" />, title: "Dress & Culture", tips: ["Dress well — Ivoirians are fashion-conscious", "Abidjan is cosmopolitan; casual chic is the norm", "Dress modestly in the north (Muslim areas) and at cultural sites", "Pagne (traditional cloth) is worn at celebrations and ceremonies"] },
      { icon: <Camera className="h-5 w-5" />, title: "Photography", tips: ["Ask permission before photographing people", "Grand-Bassam's colonial heritage sites are photo-friendly", "Avoid photographing military or government buildings", "Mask ceremonies in Man may have photography restrictions"] },
      { icon: <Banknote className="h-5 w-5" />, title: "Tipping & Bargaining", tips: ["Tip 10% at restaurants if no service charge", "Hotel porters: 1,000–2,000 CFA", "Bargaining expected at Adjamé and Treichville markets", "Fixed prices at Abidjan Mall and supermarkets"] },
    ],
    foodSafetyGuide: [
      { title: "Water Safety", icon: <Droplets className="h-5 w-5" />, content: "Don't drink tap water. Buy bottled water (Awa brand is popular). Sachet water available. Use bottled for teeth brushing." },
      { title: "Must-Try Dishes", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Attiéké (cassava couscous) with grilled fish, Alloco (fried plantain with chili), Kédjénou (slow-cooked chicken), Garba (tuna with attiéké), Foutou with palm nut sauce." },
      { title: "Street Food Tips", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Garba stands are everywhere — cheap and delicious. Try choukouya (grilled meat) in the evening. Maquis (open-air restaurants) are the best local dining experience." },
      { title: "Dietary Notes", icon: <Heart className="h-5 w-5" />, content: "Vegetarian: attiéké with vegetables, alloco, yam dishes. Fish is a major protein source. Communicate allergies in French." },
    ],
    gettingAroundGuide: [
      { title: "Gbaka (Minibuses)", icon: <Bus className="h-5 w-5" />, content: "Cheap, crowded minibuses covering Abidjan routes. Fares: 200–500 CFA. An authentic local experience but not for everyone." },
      { title: "Taxis (Orange & Red)", icon: <Car className="h-5 w-5" />, content: "Red taxis are shared; orange taxis are private. Negotiate fares. Airport to Plateau: 5,000–10,000 CFA. Woro-woro (shared taxis) are cheapest." },
      { title: "Uber & Yango", icon: <Car className="h-5 w-5" />, content: "Available in Abidjan. Reliable and air-conditioned. Cash and card accepted. Best option for visitors." },
      { title: "Intercity Buses", icon: <Bus className="h-5 w-5" />, content: "UTB, TCV, and CDI Transport run comfortable intercity routes. Abidjan–Yamoussoukro: 4,000–6,000 CFA, 3 hours. Abidjan–Man: 8,000–12,000 CFA, 8 hours." },
      { title: "Domestic Flights", icon: <Plane className="h-5 w-5" />, content: "Air Côte d'Ivoire connects Abidjan to Bouaké, Man, San Pedro, and Korhogo. Saves time on long routes." },
      { title: "Car Rental", icon: <Navigation className="h-5 w-5" />, content: "Available with driver in Abidjan. 30,000–60,000 CFA/day. Recommended for western regions (Man, Taï National Park)." },
    ],
    insuranceTip: "Travel insurance essential. PISAM and Polyclinique Internationale in Abidjan offer good private care. Carry insurance documents at all times.",
  },

  mali: {
    code: "mali",
    name: "Mali",
    flag: "🇲🇱",
    currency: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
    emergencyContacts: [
      { label: "Police", number: "17", description: "Police Nationale du Mali" },
      { label: "Fire / Ambulance", number: "18", description: "Sapeurs-Pompiers" },
      { label: "Gendarmerie", number: "20 22 5590", description: "National Gendarmerie" },
      { label: "US Embassy Bamako", number: "+223 20 70 2300", description: "American Citizens Services" },
      { label: "French Embassy", number: "+223 20 21 5757", description: "Ambassade de France" },
    ],
    visaInfo: [
      { title: "ECOWAS Nationals", content: "ECOWAS citizens can enter Mali visa-free for up to 90 days." },
      { title: "Visa Required (Most Others)", content: "Most non-ECOWAS travelers need a visa. Apply at the nearest Malian embassy. Single entry (30 days): ~$100–150. Processing: 5–10 business days. eVisa may be available." },
      { title: "Travel Advisory", content: "CHECK YOUR GOVERNMENT'S TRAVEL ADVISORY before visiting. Some regions (northern Mali, central Mali) have travel warnings. Bamako and Ségou are generally safer. Always register with your embassy." },
      { title: "Required Documents", content: "Valid passport (6+ months), visa, proof of accommodation, return ticket, yellow fever certificate, proof of funds." },
      { title: "Yellow Fever Vaccination", content: "MANDATORY. International Certificate of Vaccination required at all entry points." },
    ],
    currencyInfo: [
      { icon: <Banknote className="h-5 w-5" />, title: "Currency", content: "West African CFA Franc (XOF), same as other UEMOA countries. 1 EUR = 655.957 XOF. 1 USD ≈ 600–620 XOF." },
      { icon: <CreditCard className="h-5 w-5" />, title: "Cards & ATMs", content: "ATMs in Bamako (Ecobank, BMS, BNDA). Very limited elsewhere. Visa preferred over Mastercard. Carry sufficient cash, especially outside Bamako." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Mobile Money", content: "Orange Money is dominant. Essential for payments. Register at any Orange shop with passport. Widely accepted even in smaller towns." },
      { icon: <Globe className="h-5 w-5" />, title: "Exchange Tips", content: "Bring Euros for best rates. Forex bureaux near Bamako Grand Marché. US dollars are also accepted but at worse rates." },
    ],
    simGuide: [
      { provider: "Orange Mali", color: "bg-orange-100 text-orange-800", details: "Dominant network. Best coverage including some rural areas. Data: 1GB ~500 CFA. Orange Money included." },
      { provider: "Malitel", color: "bg-green-100 text-green-800", details: "State-owned. Decent coverage in Bamako and major towns. Budget-friendly data plans." },
    ],
    simHow: "Buy a SIM at Bamako-Sénou Airport or any provider shop. Passport required. Registration: 10 minutes. Airtime sold at small shops and street vendors everywhere.",
    wifiNote: "Hotels in Bamako offer Wi-Fi (3–10 Mbps). Very limited outside the capital. Mobile data (3G/4G) is the primary internet option. Download everything offline before leaving Bamako.",
    packingExtras: ["French phrasebook", "Photocopy of visa and passport", "Dust mask (Harmattan season)", "Modest clothing for mosque visits"],
    plugType: "European Type C/E",
    weatherSeasons: [
      { season: "Cool Dry (Harmattan)", months: "November – February", icon: <Sun className="h-5 w-5" />, temp: "20°C – 33°C", description: "Best time to visit. Comfortable temperatures. Festival au Désert and Festival sur le Niger. Dusty haze from Saharan winds.", best: true },
      { season: "Hot Dry", months: "March – May", icon: <Thermometer className="h-5 w-5" />, temp: "30°C – 45°C", description: "Extremely hot, especially in the north. Bamako reaches 40°C+. Difficult for travel. Stay hydrated.", best: false },
      { season: "Rainy Season", months: "June – October", icon: <CloudRain className="h-5 w-5" />, temp: "24°C – 34°C", description: "Heavy rains. Niger River rises dramatically. Roads can be impassable. Green landscapes but challenging travel conditions.", best: false },
    ],
    etiquetteGuide: [
      { icon: <HandshakeIcon className="h-5 w-5" />, title: "Greetings", tips: ["Greetings in Mali are lengthy and essential — asking about family, health, and work", "Bambara: 'I ni ce' (good morning), 'I ni tile' (good afternoon)", "Always greet before any business or conversation", "Touch your right hand to your heart after a handshake for extra respect"] },
      { icon: <Heart className="h-5 w-5" />, title: "Dress & Religion", tips: ["Mali is predominantly Muslim — dress modestly everywhere", "Cover shoulders and knees, especially in Timbuktu and Djenné", "Remove shoes before entering mosques (tourists can visit some)", "Respect prayer times — businesses may close briefly"] },
      { icon: <Camera className="h-5 w-5" />, title: "Photography", tips: ["Always ask before photographing people — especially in Dogon country", "Photography fees are common at tourist sites (500–2,000 CFA)", "The Great Mosque of Djenné is iconic but entry may be restricted to Muslims", "Never photograph military checkpoints"] },
      { icon: <Banknote className="h-5 w-5" />, title: "Tipping & Bargaining", tips: ["Tip guides 2,000–5,000 CFA per day", "Small tips (500 CFA) at restaurants", "Bargaining is essential at markets — Bamako Grand Marché is huge", "Dogon country guides expect 15,000–25,000 CFA/day"] },
    ],
    foodSafetyGuide: [
      { title: "Water Safety", icon: <Droplets className="h-5 w-5" />, content: "Do NOT drink tap water. Buy bottled water (Diago brand is popular). Carry water purification tablets for rural travel." },
      { title: "Must-Try Dishes", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Riz au Gras (one-pot rice), Tiguadèguè (peanut stew), Brochettes (grilled meat), Tô (millet paste with okra sauce), Dégué (millet yogurt dessert), Bissap juice (hibiscus)." },
      { title: "Street Food Tips", icon: <UtensilsCrossed className="h-5 w-5" />, content: "Try grilled brochettes at evening stands. Sandwich shops serve baguettes with omelette or grilled meat. Freshly squeezed ginger juice (jinjinbèrè) is refreshing." },
      { title: "Dietary Notes", icon: <Heart className="h-5 w-5" />, content: "Vegetarian: rice, bean dishes, tô with vegetable sauce. Meat is central to Malian cuisine — specify clearly if vegetarian. Communicate in French." },
    ],
    gettingAroundGuide: [
      { title: "Sotrama (Minibuses)", icon: <Bus className="h-5 w-5" />, content: "Bamako's main public transport. Green minibuses running fixed routes. Very cheap (150–300 CFA) but crowded. An authentic experience." },
      { title: "Taxis", icon: <Car className="h-5 w-5" />, content: "Green and yellow taxis in Bamako. Negotiate fare before entering. Airport to city: 10,000–15,000 CFA. Short rides: 1,000–3,000 CFA." },
      { title: "Intercity Buses", icon: <Bus className="h-5 w-5" />, content: "Bani Transport, Binke Transport, Diarra Transport run major routes. Bamako–Ségou: 5,000 CFA, 4 hours. Bamako–Mopti: 10,000 CFA, 8 hours." },
      { title: "Pinasse (River Boats)", icon: <Navigation className="h-5 w-5" />, content: "Traditional boats on the Niger River. Mopti–Timbuktu by pinasse is a legendary journey (2–3 days). Best November–February when river is high." },
      { title: "Car Rental", icon: <Navigation className="h-5 w-5" />, content: "Available with driver in Bamako. 30,000–50,000 CFA/day. Essential for Dogon Country and rural exploration. 4x4 recommended." },
    ],
    insuranceTip: "Travel insurance is ESSENTIAL for Mali. Medical facilities are limited. Hôpital du Point G in Bamako is the main hospital. Serious cases require evacuation to Dakar or Europe. Ensure your policy covers medical evacuation.",
  },
};

export const COUNTRY_LIST = Object.values(countryEssentials);
