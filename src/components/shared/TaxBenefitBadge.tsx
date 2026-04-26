import { IndianRupee } from "lucide-react";

interface TaxBenefitBadgeProps {
  amount?: string;
  section?: string;
  className?: string;
}

export default function TaxBenefitBadge({
  amount = "₹46,800",
  section = "80C & 10(10D)",
  className = "",
}: TaxBenefitBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${className}`}
    >
      <IndianRupee className="h-3.5 w-3.5" />
      <span>Save up to {amount}</span>
      <span className="text-emerald-400">&middot;</span>
      <span className="text-emerald-600">Sec {section}</span>
    </span>
  );
}
