import { Bell, LogOut, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 border-b border-red-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button aria-label="Open dashboard menu" className="btn-muted px-3 lg:hidden" onClick={onMenuClick}><Menu size={18} /></button>
            <div>
              <p className="text-xs font-semibold uppercase text-red-700">Networkers</p>
              <h1 className="text-base font-bold text-[#1A1A1A] sm:text-lg">Chapter referral workspace</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="btn-muted px-3"><Bell size={17} /></Link>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <button className="btn-muted px-3" onClick={() => { logout(); navigate("/"); }}><LogOut size={17} /></button>
        </div>
      </div>
    </header>
  );
}
