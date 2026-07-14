import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: -40, y: -40 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

    const move = (event) => {
      setVisible(true);
      setPosition({ x: event.clientX, y: event.clientY });
      setActive(Boolean(event.target.closest("a, button, .card, [role='button']")));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  if (!visible) return null;
  return (
    <div
      className={`pointer-events-none fixed left-0 top-0 z-[80] hidden rounded-full border border-[#0D9488] mix-blend-multiply transition-[height,width,opacity] duration-200 lg:block ${active ? "h-12 w-12 bg-teal-200/25" : "h-5 w-5 bg-white/40"}`}
      style={{ transform: `translate3d(${position.x - (active ? 24 : 10)}px, ${position.y - (active ? 24 : 10)}px, 0)` }}
    />
  );
}
