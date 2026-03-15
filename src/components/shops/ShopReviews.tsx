import { useState } from "react";
import { Star, Send, Trash2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ShopReviewsProps {
  shopId: string;
}

function StarRating({ rating, onChange, readonly = false, size = "md" }: {
  rating: number;
  onChange?: (r: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState(0);
  const s = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn("transition-colors", readonly ? "cursor-default" : "cursor-pointer")}
        >
          <Star
            className={cn(
              s,
              (hover || rating) >= star
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ShopReviews({ shopId }: ShopReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const { data: reviews = [] } = useQuery({
    queryKey: ["shop-reviews", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_reviews")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch profiles for reviewers
  const userIds = [...new Set(reviews.map((r: any) => r.user_id))];
  const { data: profiles = [] } = useQuery({
    queryKey: ["reviewer-profiles", userIds.join(",")],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      return data || [];
    },
    enabled: userIds.length > 0,
  });

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.user_id, p]));
  const userReview = user ? reviews.find((r: any) => r.user_id === user.id) : null;

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user || newRating === 0) return;
      const { error } = await supabase.from("shop_reviews").insert({
        shop_id: shopId,
        user_id: user.id,
        rating: newRating,
        comment: newComment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-reviews", shopId] });
      setNewRating(0);
      setNewComment("");
      toast({ title: "Review submitted!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateReview = useMutation({
    mutationFn: async () => {
      if (!editingId) return;
      const { error } = await supabase.from("shop_reviews").update({
        rating: editRating,
        comment: editComment.trim() || null,
      }).eq("id", editingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-reviews", shopId] });
      setEditingId(null);
      toast({ title: "Review updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-reviews", shopId] });
      toast({ title: "Review deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const startEdit = (review: any) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">
          Reviews ({reviews.length})
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} readonly size="sm" />
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Write review form */}
      {user && !userReview && (
        <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
          <p className="text-sm font-medium">Leave a review</p>
          <StarRating rating={newRating} onChange={setNewRating} />
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={3}
            className="resize-none"
          />
          <Button
            size="sm"
            onClick={() => submitReview.mutate()}
            disabled={newRating === 0 || submitReview.isPending}
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            {submitReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">
          <a href="/login" className="text-primary underline">Log in</a> to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => {
            const profile = profileMap[review.user_id];
            const isOwn = user?.id === review.user_id;
            const isEditing = editingId === review.id;

            return (
              <div key={review.id} className="border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(profile?.display_name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile?.display_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(review.created_at), "MMM d, yyyy")}</p>
                  </div>
                  {!isEditing && <StarRating rating={review.rating} readonly size="sm" />}
                  {isOwn && !isEditing && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(review)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteReview.mutate(review.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <StarRating rating={editRating} onChange={setEditRating} />
                    <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={2} className="resize-none" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateReview.mutate()} disabled={editRating === 0 || updateReview.isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
