import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };

    verify();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f] mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    localStorage.removeItem("auth_token");
    return <Navigate to="/agent-login" replace />;
  }

  return <Outlet />;
}
