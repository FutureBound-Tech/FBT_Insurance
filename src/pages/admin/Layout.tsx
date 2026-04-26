import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:pl-64 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
