export default function GalleryTabs({ tabs, active, onChange }) {
  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4">
      <div className="flex max-w-full gap-2 overflow-x-auto rounded-full bg-white p-2 shadow-premium">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8262A] ${
              active === tab ? "bg-[#E8262A] text-white shadow-sm shadow-red-700/20" : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
