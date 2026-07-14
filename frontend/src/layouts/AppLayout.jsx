import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F5F5]">
      <Sidebar />
      <Sidebar mobile open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-7xl p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
