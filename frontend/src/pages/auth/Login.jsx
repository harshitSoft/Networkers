import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@networkers.com", password: "admin123" });
  async function submit(e) {
    e.preventDefault();
    try {
      const user = await login(form);
      navigate(user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }
  return <AuthFrame title="Login" footer={<span>Membership is admin-created. Contact admin to join.</span>}>
    <form onSubmit={submit} className="space-y-4">
      <input className="field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="field" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button disabled={loading} className="btn-primary w-full">Login</button>
    </form>
  </AuthFrame>;
}

export function AuthFrame({ title, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#4D4D4D] to-[#B91C1C] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-glow">
        <Link to="/" className="text-2xl font-black text-[#1A1A1A]">Network<span className="text-[#E8262A]">ers</span></Link>
        <h1 className="mt-6 text-3xl font-black text-slate-950">{title}</h1>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>
      </div>
    </div>
  );
}
