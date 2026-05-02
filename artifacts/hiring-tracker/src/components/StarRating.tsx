import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null | undefined;
  max?: number;
  size?: "sm" | "md";
}

export function StarRating({ value, max = 5, size = "sm" }: StarRatingProps) {
  if (!value) return <span className="text-xs text-muted-foreground">Not rated</span>;
  const iconClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(iconClass, i < value ? "fill-amber-400 text-amber-400" : "text-muted")}
        />
      ))}
    </div>
  );
}
