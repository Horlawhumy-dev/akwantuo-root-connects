import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function useRecentReviews() {
  return useQuery({
    queryKey: ["recent_reviews_with_profiles"],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from("stay_reviews")
        .select("*, stays(name, region, country)")
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;

      const userIds = [...new Set(reviews.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      return reviews.map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id) ?? null,
      }));
    },
  });
}

export function TestimonialsCarousel() {
  const { data: reviews, isLoading } = useRecentReviews();

  if (isLoading || !reviews || reviews.length === 0) return null;

  return (
    <section className="py-24 adinkra-bg">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
            What Travelers <span className="text-gradient-kente italic">Are Saying</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Real experiences from diaspora travelers reconnecting with their roots.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto px-12">
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {reviews.map((review) => {
                const stay = review.stays as any;
                const initials = (review.profile?.display_name ?? "G")
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="h-full"
                    >
                      <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col card-hover">
                        <Quote className="h-7 w-7 text-primary/25 mb-3 shrink-0" />

                        {review.comment && (
                          <p className="text-sm text-foreground/80 leading-relaxed mb-4 flex-1 line-clamp-4 italic">
                            "{review.comment}"
                          </p>
                        )}

                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={review.profile?.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {review.profile?.display_name ?? "Guest"}
                            </p>
                            {stay && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {stay.name} · {stay.region}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
