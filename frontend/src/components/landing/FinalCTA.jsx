import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "./Motion.jsx";

export default function FinalCTA() {
  return (
    <section className="px-4 py-20">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#1E3A8A] via-[#155E75] to-[#0D9488] px-6 py-16 text-center text-white shadow-2xl sm:px-10">
        <div className="landing-network-bg absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Your Network Should Create Opportunities.</h2>
          <p className="mt-5 text-lg leading-8 text-blue-50">Join business owners who believe the strongest businesses are built through trusted relationships.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="landing-cta bg-white text-[#1E3A8A] hover:bg-blue-50">Join Networkers <ArrowRight size={18} /></Link>
            <Link to="/login" className="landing-cta border border-white/30 text-white hover:bg-white/10">Explore the Network</Link>
          </div>
          <p className="mt-5 text-sm font-semibold text-blue-100">Create your business profile and start building valuable connections.</p>
        </div>
      </Reveal>
    </section>
  );
}
