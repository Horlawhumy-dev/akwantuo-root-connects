import { useIsPageEnabled } from "@/hooks/use-page-visibility";
import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PageGuardProps {
  slug: string;
  children: React.ReactNode;
}

export function PageGuard({ slug, children }: PageGuardProps) {
  const { enabled, isLoading } = useIsPageEnabled(slug);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Construction className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Coming Soon</h1>
          <p className="text-muted-foreground mb-6">
            We're working hard to bring you this page. Check back soon for updates!
          </p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
