import { CountUp, Reveal } from "./Motion.jsx";

const stats = [
  [2500, "+", "Business Owners"],
  [8400, "+", "Trusted Connections"],
  [3200, "+", "Client Referrals"],
  [10, "Cr+", "Business Generated", "₹"],
  [120, "+", "Business Meetups"]
];

export default function ImpactStats() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 sm:py-24">
      <div className="landing-network-bg absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl text-center">
        <Reveal>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Real Connections. Measurable Business Impact.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map(([value, suffix, label, prefix = ""], index) => (
            <Reveal key={label} delay={index * 0.05} className="rounded-lg border border-slate-200 bg-[#F8FAFC]/90 p-6 shadow-sm backdrop-blur">
              <CountUp value={value} prefix={prefix} suffix={suffix} className="text-4xl font-black tracking-tight text-[#1E3A8A]" />
              <p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
