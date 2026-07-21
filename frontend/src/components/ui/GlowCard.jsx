export default function GlowCard({ children, className = "", hover = true, as: Component = "div", ...props }) {
  return (
    <Component
      className={[
        "glass-card group relative overflow-hidden rounded-3xl",
        hover ? "glass-card-hover" : "",
        className
      ].join(" ")}
      {...props}
    >
      <span aria-hidden="true" className="shine-sweep" />
      <div className="relative z-10 h-full p-6">
        {children}
      </div>
    </Component>
  );
}
