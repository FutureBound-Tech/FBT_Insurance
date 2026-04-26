import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  agentName?: string;
  agentRole?: string;
  avatarUrl?: string;
}

const sidebarLinks = [
  { to: "/agent-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agent-dashboard/leads", label: "Leads", icon: Users },
  { to: "/agent-dashboard/policies", label: "Policies", icon: Shield },
  { to: "/agent-dashboard/follow-ups", label: "Follow-ups", icon: Calendar },
  { to: "/agent-dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  agentName = "Agent",
  agentRole = "LIC Advisor",
  avatarUrl,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const initials = agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/agent-login");
  };

  const sidebarContent = (
    <div
      className={cn(
        "flex h-full flex-col text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      {/* Logo / Agent */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={agentName} className="h-10 w-10 rounded-full border-2 border-amber-400 object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20">
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold">{agentName}</p>
              <p className="truncate text-[11px] text-slate-400">{agentRole}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:inline-flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Navigation</p>
        )}
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            location.pathname === link.to ||
            (link.to !== "/agent-dashboard" && location.pathname.startsWith(link.to));

          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/8 hover:text-white",
                collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-amber-400" />
              )}
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-amber-400")} />
              {!collapsed && <span>{link.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse (when collapsed) */}
      {collapsed && (
        <div className="px-3 pb-2">
          <button
            onClick={() => setCollapsed(false)}
            className="flex w-full items-center justify-center rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl text-sm font-medium text-slate-400 transition-all hover:bg-red-500/15 hover:text-red-400",
            collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
        {sidebarContent}
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-20 z-40 rounded-xl bg-slate-900 p-2.5 text-white shadow-lg lg:hidden"
        aria-label="Open sidebar"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
