import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <input {...props} className="field !pr-12" type={visible ? "text" : "password"} minLength={props.minLength ?? 8} maxLength={props.maxLength ?? 128} />
      <button type="button" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-brand-muted transition hover:bg-red-500/10 hover:text-brand-accent" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
