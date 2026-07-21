export default function GlowButton({ children, variant = "primary", loading = false, className = "", ...props }) {
  return <button className={`glow-button glow-button-${variant} ${className}`} disabled={loading || props.disabled} {...props}>{loading && <span className="spinner" />}{children}</button>;
}
