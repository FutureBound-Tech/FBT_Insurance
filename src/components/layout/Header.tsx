import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, ArrowRight, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/calculator", label: "Calculator" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const profile = localStorage.getItem("assessment_profile");
      if (profile) {
        try {
          const p = JSON.parse(profile);
          setUserName(p.fullName || "User");
        } catch { setUserName(null); }
      } else {
        setUserName(null);
      }
    };
    checkSession();
    window.addEventListener("storage", checkSession);
    const interval = setInterval(checkSession, 2000);
    return () => { window.removeEventListener("storage", checkSession); clearInterval(interval); };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("assessment_profile");
    localStorage.removeItem("assessment_recommendations");
    localStorage.removeItem("assessment_lead_id");
    localStorage.removeItem("assessment_timestamp");
    setUserName(null);
    setUserMenuOpen(false);
    navigate("/");
  };

  const initials = userName ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-xl border-b shadow-sm" : "bg-white border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-gold shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-gray-900 tracking-tight">FBT Insurance</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium">LIC Agent Pro</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={cn("relative rounded-lg px-4 py-2 text-sm font-medium transition-colors", location.pathname === link.to ? "text-primary" : "text-gray-500 hover:text-gray-900")}>
              {link.label}
              {location.pathname === link.to && (
                <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full gradient-gold" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              )}
            </Link>
          ))}

          {userName ? (
            <div className="relative ml-4">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials}</div>
                <span className="hidden lg:block max-w-[100px] truncate">{userName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="h-4 w-4 text-gray-400" /> My Dashboard
                    </Link>
                    <div className="my-1 h-px bg-gray-100" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/assessment" className="ml-4 inline-flex items-center gap-2 rounded-lg gradient-gold px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </nav>

        <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t bg-white md:hidden">
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={cn("rounded-lg px-4 py-3 text-sm font-medium transition-colors", location.pathname === link.to ? "text-primary bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")}>
                  {link.label}
                </Link>
              ))}
              {userName ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <LayoutDashboard className="h-4 w-4" /> My Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/assessment" onClick={() => setMobileOpen(false)} className="mt-2 rounded-lg gradient-gold px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-amber-500/20">
                  Get Started Free
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
