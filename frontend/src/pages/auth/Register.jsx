import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthFrame } from "./Login.jsx";
import PasswordField from "../../components/PasswordField.jsx";
import { normalizePhone } from "../../utils/formValues.js";

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
      {["fullName", "email", "mobile"].map((key) => (
        <input key={key} name={key} required className="field" type={key === "email" ? "email" : key === "mobile" ? "tel" : "text"} placeholder={key === "fullName" ? "Full name" : key[0].toUpperCase() + key.slice(1)} value={form[key]} onChange={({ currentTarget: { value } }) => setForm((current) => ({ ...current, [key]: key === "mobile" ? normalizePhone(value) : value }))} />
      ))}
      <PasswordField name="password" required placeholder="Password" value={form.password} onChange={({ target: { value } }) => setForm((current) => ({ ...current, password: value }))} />
      <button disabled={loading} className="btn-primary w-full">Register</button>
    </form>
  </AuthFrame>;
}
