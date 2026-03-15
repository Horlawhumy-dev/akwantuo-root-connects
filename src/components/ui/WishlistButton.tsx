import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface WishlistButtonProps {
  itemType: "stay" | "destination" | "event";
  itemId: string;
  className?: string;
  variant?: "icon" | "full";
}

export function WishlistButton({ itemType, itemId, className, variant = "icon" }: WishlistButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const saved = isWishlisted(itemType, itemId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    toggleWishlist.mutate({ itemType, itemId });
  };

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={cn("gap-2", className)}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-destructive text-destructive")} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors",
        className
      )}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <Heart className={cn("h-4 w-4", saved ? "fill-destructive text-destructive" : "text-foreground")} />
    </button>
  );
}
