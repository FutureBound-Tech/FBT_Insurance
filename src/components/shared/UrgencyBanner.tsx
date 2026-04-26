import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface UrgencyBannerProps {
  message?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function UrgencyBanner({
  message = "Limited Time: Premium rates may increase next month. Get your quote today!",
  ctaText,
  onCtaClick,
}: UrgencyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="sticky top-0 z-[60] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-900" />
        <p className="text-center text-xs font-semibold text-amber-950 sm:text-sm">
          {message}
          {ctaText && (
            <button
              onClick={onCtaClick}
              className="ml-2 inline-block font-bold underline underline-offset-2 hover:text-amber-800"
            >
              {ctaText}
            </button>
          )}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-0.5 text-amber-900 transition hover:bg-amber-600/30 hover:text-amber-950"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
