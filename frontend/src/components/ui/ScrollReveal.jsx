import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({ children, delay = 0, direction = "up", className = "", as: Component = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setShown(true), { threshold: .12 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <Component ref={ref} className={`reveal reveal-${direction} ${shown ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</Component>;
}
