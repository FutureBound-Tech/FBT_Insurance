import { Link, useLocation } from "react-router-dom";
import { X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Free Assessment" },
  { to: "/calculator", label: "Calculator" },
];

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 flex w-72 flex-col bg-[#1e3a5f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-400" />
            <span className="text-sm font-bold text-white">FBT Insurance</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white transition hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onClose}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    location.pathname === link.to
                      ? "bg-white/15 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-xs text-blue-300">
            &copy; {new Date().getFullYear()} FBT Insurance
          </p>
        </div>
      </div>
    </div>
  );
}
