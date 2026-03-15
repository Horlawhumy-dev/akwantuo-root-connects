import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, Mail, Phone, ExternalLink, User, ArrowLeft, Home, Building2, House, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BookingRequestForm } from "@/components/stays/BookingRequestForm";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { SEOHead } from "@/components/SEOHead";

const typeLabels: Record<string, string> = {
  guesthouse: "Guest House",
  boutique_hotel: "Boutique Hotel",
  homestay: "Homestay",
};

const priceLabels: Record<string, string> = {
  budget: "Budget ($)",
  mid_range: "Mid-Range ($$)",
  luxury: "Luxury ($$$)",
};

export default function StayDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: stay, isLoading } = useQuery({
    queryKey: ["stay", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stays")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["stay-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stay_reviews")
        .select("*, profiles:user_id(display_name)")
        .eq("stay_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("stay_reviews").insert({
        stay_id: id!,
        user_id: user.id,
        rating,
        comment: comment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Review submitted!", description: "Thank you for sharing your experience." });
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["stay-reviews", id] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message?.includes("duplicate") ? "You've already reviewed this stay" : err.message, variant: "destructive" });
    },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : null;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading stay details...</p>
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Stay not found</p>
        <Button asChild variant="outline"><Link to="/stays">Back to Stays</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={stay.name}
        description={`${typeLabels[stay.type]} in ${stay.region}, ${stay.country}. ${stay.description.slice(0, 140)}`}
        image={stay.image_urls?.[0]}
        jsonLd={{
          "@type": "LodgingBusiness",
          name: stay.name,
          description: stay.description,
          image: stay.image_urls?.[0],
          address: { "@type": "PostalAddress", addressRegion: stay.region, addressCountry: stay.country },
          ...(avgRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: reviews.length } } : {}),
        }}
      />
      {/* Hero image */}
      <section className="relative h-[40vh] md:h-[50vh] bg-charcoal">
        {stay.image_urls?.[0] ? (
          <img src={stay.image_urls[0]} alt={stay.name} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full adinkra-bg-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <WishlistButton itemType="stay" itemId={stay.id} variant="full" className="text-charcoal-foreground border-charcoal-foreground/30" />
              <Button variant="ghost" size="sm" className="text-charcoal-foreground/60" asChild>
                <Link to="/stays"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Stays</Link>
              </Button>
              {user?.id === stay.host_id && (
                <Button variant="ghost" size="sm" className="text-charcoal-foreground/60" asChild>
                  <Link to={`/stays/${stay.id}/edit`}><Pencil className="h-4 w-4 mr-1" /> Edit</Link>
                </Button>
              )}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-primary/90 text-primary-foreground border-0">
                  {typeLabels[stay.type]}
                </Badge>
                <Badge variant="outline" className="border-charcoal-foreground/30 text-charcoal-foreground">
                  {priceLabels[stay.price_range]}
                </Badge>
                {(stay as any).price_per_night > 0 && (
                  <Badge variant="outline" className="border-charcoal-foreground/30 text-charcoal-foreground">
                    GH₵{((stay as any).price_per_night).toLocaleString()}/night
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-foreground mb-2">
                {stay.name}
              </h1>
              <div className="flex items-center gap-3 text-charcoal-foreground/70">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {stay.region}, {stay.country}
                </span>
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {avgRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-4">About This Stay</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{stay.description}</p>
              </div>

              {/* Amenities */}
              {stay.amenities?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {stay.amenities.map((a: string) => (
                      <Badge key={a} variant="secondary" className="px-3 py-1">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Image gallery */}
              {stay.image_urls?.length > 1 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {stay.image_urls.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`${stay.name} ${i + 1}`} className="rounded-lg w-full h-40 object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-4">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h2>

                {reviews.length === 0 ? (
                  <p className="text-muted-foreground">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {review.profiles?.display_name || "Anonymous"}
                          </span>
                          <div className="flex items-center gap-0.5 ml-auto">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground ml-6">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit review */}
                {user ? (
                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="font-medium mb-3">Leave a Review</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onMouseEnter={() => setHoveredStar(s)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setRating(s)}
                        >
                          <Star className={`h-6 w-6 cursor-pointer transition-colors ${
                            s <= (hoveredStar || rating) ? "fill-primary text-primary" : "text-muted"
                          }`} />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share your experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="mb-3"
                    />
                    <Button onClick={() => submitReview.mutate()} disabled={submitReview.isPending}>
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground border-t border-border pt-4 mt-4">
                    <Link to="/login" className="text-primary hover:underline">Sign in</Link> to leave a review
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Request Form */}
              <BookingRequestForm 
                stayId={stay.id} 
                hostId={stay.host_id} 
                stayName={stay.name}
                pricePerNight={(stay as any).price_per_night || 0}
                hostEmail={stay.contact_email || undefined}
                hostName={stay.host_name}
              />

              {/* Host info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-3">Your Host</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{stay.host_name}</span>
                </div>
                {stay.host_bio && (
                  <p className="text-sm text-muted-foreground mb-4">{stay.host_bio}</p>
                )}
              </div>

              {/* Contact */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-3">
                <h3 className="font-display text-lg font-semibold">Contact & Booking</h3>
                {stay.contact_email && (
                  <a href={`mailto:${stay.contact_email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" /> {stay.contact_email}
                  </a>
                )}
                {stay.contact_phone && (
                  <a href={`tel:${stay.contact_phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" /> {stay.contact_phone}
                  </a>
                )}
                {stay.booking_url && (
                  <Button asChild className="w-full mt-2">
                    <a href={stay.booking_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> Book Now
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
