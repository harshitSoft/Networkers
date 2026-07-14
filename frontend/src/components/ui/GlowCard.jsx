export default function GlowCard({ children, className = "", blobColor = "rgba(232,38,42,.18)", hover = true, as: Component = "div", ...props }) {
  return (
    <Component
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/90 bg-white p-0 shadow-premium",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white before:via-white before:to-red-50/50",
        hover ? "transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(26,26,26,.12)]" : "",
        className
      ].join(" ")}
      {...props}
    >
      <span
        aria-hidden="true"
        className="glow-card-blob absolute -right-12 -top-14 h-36 w-36 rounded-full blur-3xl transition duration-500 group-hover:scale-125"
        style={{ backgroundColor: blobColor }}
      />
      <span aria-hidden="true" className="absolute -bottom-16 left-8 h-28 w-28 rounded-full bg-red-100/45 blur-3xl" />
      <div className="relative z-10 h-full rounded-2xl bg-white/82 p-5 backdrop-blur-sm">
        {children}
      </div>
    </Component>
  );
}
