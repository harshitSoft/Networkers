import { ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "./Motion.jsx";

const filters = ["All Businesses", "Technology", "Construction", "Marketing", "Finance", "Real Estate"];
const businesses = [
  ["TechNova Demo Labs", "IT Company", "Indore", ["Website Development", "ERP Software", "Mobile Apps"]],
  ["BuildCore Demo Constructions", "Construction Company", "Indore", ["Commercial Building", "Renovation", "Project Planning"]],
  ["GrowthEdge Marketing", "Digital Marketing", "Indore", ["SEO", "Social Media Marketing", "Branding"]],
  ["StudioArc Demo Interiors", "Interior Design Firm", "Bhopal", ["Office Design", "Home Interiors", "Commercial Design"]],
  ["Jain Demo Finance Advisory", "Finance Consultant", "Indore", ["Tax Planning", "Business Loans", "Investment Advisory"]]
];

export default function BusinessPreview() {
  const navigate = useNavigate();
  const explore = () => navigate(localStorage.getItem("networkers_token") ? "/businesses" : "/login");

  return (
    <section id="network" className="px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Build a Network That Works for Your Business</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">Preview relevant businesses, services, and connection paths before you reach out.</p>
          </div>
          <button onClick={explore} className="landing-cta bg-[#1E3A8A] text-white hover:bg-blue-800">Explore Business Network <ArrowRight size={18} /></button>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <span key={filter} className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-[#0D9488] text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{filter}</span>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {businesses.map(([name, category, location, services], index) => (
            <Reveal key={name} delay={index * 0.05} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-blue-50 text-lg font-black text-[#1E3A8A]">{name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                <div>
                  <h3 className="text-xl font-black">{name}</h3>
                  <p className="font-bold text-[#0D9488]">{category}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={15} /> {location}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {services.map((service) => <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{service}</span>)}
              </div>
              <button className="mt-5 w-full rounded-lg border border-teal-200 px-4 py-2 text-sm font-black text-[#0D9488] transition group-hover:bg-teal-50">Connect</button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
