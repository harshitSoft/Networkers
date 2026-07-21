import { useEffect, useRef, useState } from "react";
export default function StatsCounter({ value, suffix = "", duration = 1600 }) {
  const [count, setCount] = useState(0); const ref = useRef(null);
  useEffect(() => { const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; const start = performance.now(); const tick = (now) => { const p = Math.min(1, (now - start) / duration); setCount(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); io.disconnect(); }); if (ref.current) io.observe(ref.current); return () => io.disconnect(); }, [duration, value]);
  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}
