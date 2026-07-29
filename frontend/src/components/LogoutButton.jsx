import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LogoutButton({ className = "", iconOnly = false, onConfirmed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  function askToLogout() {
    toast.custom((notice) => (
      <div className="theme-dialog w-[min(92vw,360px)] rounded-2xl border p-4 shadow-2xl">
        <p className="font-bold">Sign out of Networkers?</p>
        <p className="mt-1 text-sm text-brand-muted">You will need to sign in again to access your dashboard.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-muted !px-4 !py-2" onClick={() => toast.dismiss(notice.id)}>Stay signed in</button>
          <button type="button" className="btn-primary !px-4 !py-2" onClick={() => { toast.dismiss(notice.id); onConfirmed?.(); logout(); navigate("/"); }}>Sign out</button>
        </div>
      </div>
    ), { duration: Infinity, id: "logout-confirmation" });
  }
  return <button type="button" aria-label="Sign out" className={className} onClick={askToLogout}><LogOut size={iconOnly ? 17 : 15}/>{!iconOnly && "Sign out"}</button>;
}
