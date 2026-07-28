import AppRoutes from "./routes/AppRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import NetworkCanvas from "./components/ui/NetworkCanvas.jsx";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Loader from "./components/Loader.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import useFormValidation from "./hooks/useFormValidation.js";

export default function App() {
  const { pathname } = useLocation();
  const { loading: authLoading, operation } = useAuth();
  const [booting, setBooting] = useState(true);
  useFormValidation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1400);
    return () => clearTimeout(timer);
  }, []);
  if (booting || authLoading)
    return (
      <Loader
        fullScreen
        label={
          booting
            ? "Connecting Networkers"
            : operation === "logout"
              ? "Signing out safely"
              : "Opening your dashboard"
        }
      />
    );
  return (
    <ErrorBoundary>
      <NetworkCanvas intensity={0.8} />
      <AppRoutes />
    </ErrorBoundary>
  );
}
