import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export default function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      role="status"
    >
      <Loader2 className={cn("animate-spin text-[#1e3a5f]", sizeMap[size])} />
      <span className="sr-only">{label}</span>
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
