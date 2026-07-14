import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

export default function LightboxModal({ item, onClose, onPrevious, onNext }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrevious]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/88 p-4" role="dialog" aria-modal="true" aria-label={item.title} onMouseDown={onClose}>
      <div className="relative w-full max-w-5xl" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Close gallery image" className="absolute -top-12 right-0 rounded-full bg-white p-2 text-red-700 transition hover:bg-red-50" onClick={onClose}>
          <X size={22} />
        </button>
        <img src={item.image} alt={item.title} className="max-h-[78vh] w-full rounded-2xl object-contain shadow-2xl" />
        <div className="mt-4 rounded-2xl bg-white/95 p-4 text-[#1A1A1A]">
          <p className="text-xs font-black uppercase text-red-700">{item.category}</p>
          <h3 className="mt-1 text-xl font-black">{item.title}</h3>
          <p className="text-sm font-semibold text-slate-500">{item.date}</p>
        </div>
        <button type="button" aria-label="Previous image" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-red-700 transition hover:bg-red-50" onClick={onPrevious}>
          <ChevronLeft size={24} />
        </button>
        <button type="button" aria-label="Next image" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-red-700 transition hover:bg-red-50" onClick={onNext}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
