import { CountUp, Reveal } from "./Motion.jsx";

const categories = ["Technology", "Construction", "Marketing", "Finance", "Real Estate", "Healthcare", "Manufacturing", "Interior Design", "Consulting", "Education"];
const stats = [
  [10000, "+", "Businesses"],
  [50000, "+", "Referrals"],
  [120, "+", "Meetups"],
  [25, "+", "Cities"]
];

export default function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white py-12">
      <Reveal className="mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">Built for ambitious business owners</h2>
        <div className="mt-7 overflow-hidden">
          <div className="landing-marquee flex w-max gap-3">
            {[...categories, ...categories].map((category, index) => (
              <span key={`${category}-${index}`} className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-[#1E3A8A]">{category}</span>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, suffix, label]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-5">
              <CountUp value={value} suffix={suffix} className="text-4xl font-black tracking-tight text-[#0D9488]" />
              <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
