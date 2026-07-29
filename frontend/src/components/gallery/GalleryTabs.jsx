export default function GalleryTabs({ tabs, active, onChange }) {
  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4">
      <div className="gallery-tabs flex max-w-full gap-2 overflow-x-auto rounded-full border p-2 shadow-[0_0_25px_rgba(225,6,0,.1)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8262A] ${
              active === tab ? "active bg-[#E10600] text-white shadow-[0_0_20px_rgba(225,6,0,.4)]" : "gallery-tab-inactive border hover:border-red-500/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
