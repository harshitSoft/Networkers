import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthFrame } from "./Login.jsx";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", mobile: "", password: "" });
  async function submit(e) {
    e.preventDefault();
    try {
      await register(form);
      navigate("/business/profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  }
  return <AuthFrame title="Create your account" footer={<Link to="/login" className="font-semibold text-red-600">Already registered?</Link>}>
    <form onSubmit={submit} className="space-y-4">
      {["fullName", "email", "mobile", "password"].map((key) => (
        <input key={key} required className="field" type={key === "password" ? "password" : key === "email" ? "email" : key === "mobile" ? "tel" : "text"} minLength={key === "password" ? 8 : undefined} placeholder={key === "fullName" ? "Full name" : key[0].toUpperCase() + key.slice(1)} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      ))}
      <button disabled={loading} className="btn-primary w-full">Register</button>
    </form>
  </AuthFrame>;
}
