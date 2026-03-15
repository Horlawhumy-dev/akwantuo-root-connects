import { cn } from "@/lib/utils";

interface AdinkraIconProps {
  name: "sankofa" | "gye-nyame" | "adinkrahene" | "dwennimmen";
  size?: number;
  className?: string;
}

const paths: Record<AdinkraIconProps["name"], string> = {
  // Sankofa — "Go back and get it" (bird looking backward)
  sankofa:
    "M30 8 C30 8 18 18 18 28 C18 35 22 40 28 42 C26 44 24 48 24 52 C24 52 28 50 30 48 C32 50 36 52 36 52 C36 48 34 44 32 42 C38 40 42 35 42 28 C42 18 30 8 30 8 Z M30 22 C32 22 34 24 34 28 C34 32 32 34 30 34 C28 34 26 32 26 28 C26 24 28 22 30 22 Z",
  // Gye Nyame — "Except God" (supremacy of God)
  "gye-nyame":
    "M10 30 C10 30 14 20 22 16 C22 16 18 24 20 28 C20 28 24 18 32 14 C32 14 28 24 30 30 C30 30 34 22 42 18 C42 18 36 28 38 32 C38 32 44 24 50 22 C50 22 44 32 40 36 C40 36 46 36 50 38 C50 38 42 38 38 40 C38 40 44 44 44 50 C44 50 38 44 34 42 C34 42 36 48 34 52 C34 52 30 46 28 42 C28 42 26 48 22 50 C22 50 24 44 22 40 C22 40 16 46 12 46 C12 46 18 42 20 38 C20 38 12 40 8 38 C8 38 16 36 20 34 C20 34 12 34 10 30 Z",
  // Adinkrahene — "Chief of Adinkra symbols" (leadership)
  adinkrahene:
    "M30 10 A20 20 0 1 0 30 50 A20 20 0 1 0 30 10 Z M30 18 A12 12 0 1 0 30 42 A12 12 0 1 0 30 18 Z M30 26 A4 4 0 1 0 30 34 A4 4 0 1 0 30 26 Z",
  // Dwennimmen — "Ram's horns" (humility and strength)
  dwennimmen:
    "M30 10 C30 10 20 14 16 22 C12 30 16 38 22 40 C22 40 18 34 20 28 C22 22 26 18 30 18 C34 18 38 22 40 28 C42 34 38 40 38 40 C44 38 48 30 44 22 C40 14 30 10 30 10 Z M30 50 C30 50 20 46 16 38 M30 50 C30 50 40 46 44 38",
};

export function AdinkraIcon({ name, size = 24, className }: AdinkraIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
      aria-label={`Adinkra symbol: ${name}`}
    >
      <path d={paths[name]} fill="currentColor" />
    </svg>
  );
}
