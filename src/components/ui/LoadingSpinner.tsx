import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

const sizeMap = { sm: "h-6 w-6", md: "h-10 w-10", lg: "h-16 w-16" };

export function LoadingSpinner({ size = "md", className, message }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[40vh] gap-4", className)}>
      <svg
        className={cn("animate-spin text-primary", sizeMap[size])}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Adinkrahene — concentric circles */}
        <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <circle cx="30" cy="30" r="16" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <circle cx="30" cy="30" r="6" fill="currentColor" opacity="0.6" />
        {/* Spinning arc */}
        <path
          d="M30 4 A26 26 0 0 1 56 30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
