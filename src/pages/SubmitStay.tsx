import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const countries = ["Ghana", "Senegal", "Nigeria", "Côte d'Ivoire", "Mali"];
const amenityOptions = [
  "Wi-Fi", "Pool", "Air Conditioning", "Breakfast", "Airport Transfer",
  "Kitchen", "Parking", "Laundry", "Tour Guide", "Cultural Experience",
];

export default function SubmitStay() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("mid_range");
  const [pricePerNight, setPricePerNight] = useState<string>("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [hostName, setHostName] = useState("");
  const [hostBio, setHostBio] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("stay-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("stay-images").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }

    setImageUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !description || !country || !region || !type || !hostName) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("stays").insert({
      host_id: user.id,
      name,
      description,
      country,
      region,
      type: type as any,
      price_range: priceRange as any,
      price_per_night: pricePerNight ? parseInt(pricePerNight) : 0,
      amenities,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      booking_url: bookingUrl || null,
      host_name: hostName,
      host_bio: hostBio || null,
      image_urls: imageUrls,
      status: "pending",
    } as any);
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Stay submitted!", description: "Your listing is pending review. We'll notify you once it's approved." });
      navigate("/stays");
    }
  };

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div>
      <section className="relative py-24 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Home className="h-3 w-3 mr-1" /> Host a Stay
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-foreground mb-2">
              List Your Stay
            </h1>
            <p className="text-charcoal-foreground/60 max-w-lg mx-auto">
              Share your guest house, boutique hotel, or homestay with travelers exploring West Africa
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8 space-y-6">
            {/* Basic info */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Stay Details</h2>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Akuaba Guest House" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your stay, the neighborhood, what makes it special..." rows={5} className="mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country *</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Accra" className="mt-1" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stay Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guesthouse">Guest House</SelectItem>
                      <SelectItem value="boutique_hotel">Boutique Hotel</SelectItem>
                      <SelectItem value="homestay">Homestay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price Range *</Label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget ($)</SelectItem>
                      <SelectItem value="mid_range">Mid-Range ($$)</SelectItem>
                      <SelectItem value="luxury">Luxury ($$$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="pricePerNight">Price Per Night (GH₵) *</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  min="0"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="e.g. 15000"
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Amount in Ghana Cedis per night</p>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      amenities.includes(amenity)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <Label>Photos</Label>
              <div className="mt-2 space-y-3">
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="rounded-lg w-full h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Upload photos"}
                  </span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Host info */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Host Information</h2>
              <div>
                <Label htmlFor="hostName">Your Name *</Label>
                <Input id="hostName" value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Your name" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="hostBio">About You</Label>
                <Textarea id="hostBio" value={hostBio} onChange={(e) => setHostBio(e.target.value)} placeholder="Tell guests about yourself..." rows={3} className="mt-1" />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Contact & Booking</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+233..." className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="bookingUrl">Booking URL</Label>
                <Input id="bookingUrl" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your listing will be reviewed before being published
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
