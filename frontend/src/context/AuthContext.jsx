import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("networkers_user") || "null"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("networkers_token")) return;
    authApi.me().then(setUser).catch(() => logout());
  }, []);

  async function login(payload) {
    setLoading(true);
    try {
      const data = await authApi.login(payload);
      localStorage.setItem("networkers_token", data.token);
      localStorage.setItem("networkers_user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Welcome back");
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const data = await authApi.register(payload);
      localStorage.setItem("networkers_token", data.token);
      localStorage.setItem("networkers_user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Account created");
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("networkers_token");
    localStorage.removeItem("networkers_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, isAdmin: user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
