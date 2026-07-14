import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PublicNavbar />
      <main>
        <section
          className="relative grid min-h-[360px] place-items-center bg-cover bg-center px-4 text-center text-white"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80)" }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative max-w-3xl rounded-2xl bg-[#4D4D4D]/80 px-6 py-10 shadow-2xl backdrop-blur-sm">
            <p className="text-sm font-black uppercase tracking-wide text-red-100">About us</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">About Network<span className="text-red-200">ers</span></h1>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-4 py-14">
          <p className="max-w-3xl text-lg leading-8 text-slate-700">Networkers is a subscription-based, chapter-driven business community where verified members build trusted relationships, share referrals, and track measurable business revenue.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
          {["Chapter-based membership", "Trusted referral exchange", "Monthly and total revenue analytics", "Events, updates, and community gallery"].map((item) => (
            <GlowCard key={item}><p className="font-bold">{item}</p></GlowCard>
          ))}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
