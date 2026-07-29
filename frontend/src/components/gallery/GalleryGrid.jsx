import { ZoomIn } from "lucide-react";

export default function GalleryGrid({ items, onOpen }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen(item)}
          className="gallery-image image-frame group relative min-h-[260px] overflow-hidden rounded-3xl bg-[#111] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF1E1E]"
        >
          <img src={item.image} alt={item.title} className="h-full min-h-[260px] w-full object-cover transition duration-500 group-hover:scale-110" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-60 transition group-hover:opacity-75" />
          <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-red-700 opacity-0 transition group-hover:opacity-100">
            <ZoomIn size={18} />
          </span>
          <span className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <span className="rounded-full bg-[#E10600] px-3 py-1 text-xs font-black">{item.category}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
