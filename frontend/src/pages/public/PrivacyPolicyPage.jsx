import { Database, Eye, LockKeyhole, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useEffect } from "react";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import GlowCard from "../../components/ui/GlowCard.jsx";
import PublicNavbar from "./PublicNavbar.jsx";

const policySections = [
  {
    id: "information-we-collect",
    title: "1. Information we collect",
    content: (
      <>
        <p>We collect information you provide when you apply to join, create or update an account, build a business profile, participate in a chapter, send a referral, post in the community, register for an event, or contact us.</p>
        <p>This may include your name, email address, phone number, location, profile photo, business details, chapter membership, messages, referrals, connections, event activity, and other content you choose to share. We may also collect basic technical information such as your device type, browser, IP address, and activity needed to keep the service secure and reliable.</p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "2. How we use your information",
    content: (
      <>
        <p>We use your information to operate and improve Networkers, review membership requests, manage accounts and chapters, help members connect, enable referrals and business opportunities, organise meetings and events, send service-related communications, provide support, and protect the community from misuse.</p>
        <p>We may use aggregated or de-identified information to understand how the platform is used and improve the member experience.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "3. How information is shared",
    content: (
      <>
        <p>Information in your member or business profile may be visible to other authorised Networkers members and administrators. Content you intentionally post or share may be visible to its intended audience within the platform.</p>
        <p>We may share information with trusted service providers that help us host, secure, communicate through, and operate the platform. We may also disclose information when required by law, to protect rights and safety, or as part of a business reorganisation. We do not sell your personal information.</p>
      </>
    ),
  },
  {
    id: "retention-security",
    title: "4. Retention and security",
    content: (
      <>
        <p>We retain personal information only for as long as it is reasonably needed to provide the service, meet legal or accounting obligations, resolve disputes, and enforce agreements. Retention periods may vary depending on the type of information and why it was collected.</p>
        <p>We use reasonable administrative, technical, and organisational safeguards to protect your information. No online service can guarantee absolute security, so please use a strong password and keep your login details confidential.</p>
      </>
    ),
  },
  {
    id: "choices-rights",
    title: "5. Your choices and rights",
    content: (
      <>
        <p>You may review and update certain profile information from your account. Subject to applicable law, you may also ask us to access, correct, or delete your personal information, withdraw consent where processing relies on consent, or raise a concern about how your information is handled.</p>
        <p>Some information may need to be retained where required by law or for legitimate security, fraud-prevention, or record-keeping purposes.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies and similar technologies",
    content: (
      <p>Networkers may use cookies and similar local technologies to keep you signed in, remember preferences, maintain security, and understand service performance. You can control cookies through your browser settings, although disabling essential cookies may affect how the platform works.</p>
    ),
  },
  {
    id: "children",
    title: "7. Children’s privacy",
    content: (
      <p>Networkers is intended for professionals and is not directed to children. We do not knowingly collect personal information from children. If you believe a child has provided information to us, please contact us so we can take appropriate action.</p>
    ),
  },
  {
    id: "updates-contact",
    title: "8. Updates and contact",
    content: (
      <>
        <p>We may update this policy as Networkers evolves or legal requirements change. When we make material changes, we will post the updated policy here and revise the effective date.</p>
        <p>For privacy questions or requests, please contact the Networkers administration team through the contact details or support channel provided on the website or in your member account.</p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Privacy Policy | Networkers";
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="public-page">
      <PublicNavbar />
      <main>
        <section className="content-shell public-page-top pb-14 text-center sm:pb-20">
          <span className="status-pill"><ShieldCheck size={16} /> Your privacy matters</span>
          <h1 className="mt-6 text-5xl font-bold sm:text-7xl">Privacy, explained <span className="text-gradient">clearly.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#b3b3b3]">This policy explains what information Networkers collects, why we use it, and the choices available to you.</p>
          <p className="mt-5 font-data text-sm text-red-400">Effective: 3 August 2026</p>
        </section>

        <section className="section-solid section-pad">
          <div className="content-shell grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <GlowCard className="!p-5">
                <p className="text-sm font-bold uppercase tracking-[.12em] text-brand-primary">On this page</p>
                <nav aria-label="Privacy policy sections" className="mt-4 grid gap-1">
                  {policySections.map((section) => (
                    <a key={section.id} href={`#${section.id}`} className="rounded-xl px-3 py-2 text-sm text-brand-muted transition hover:bg-red-600/10 hover:text-red-400">{section.title}</a>
                  ))}
                </nav>
              </GlowCard>
            </aside>

            <div className="min-w-0">
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[[Database, "Purposeful collection"], [Eye, "Clear use"], [LockKeyhole, "Responsible protection"]].map(([Icon, label]) => (
                  <div key={label} className="glass-card flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold"><Icon size={20} className="shrink-0 text-red-500" />{label}</div>
                ))}
              </div>

              <div className="glass-card rounded-[2rem] p-6 sm:p-10">
                <div className="border-b border-brand-border/20 pb-8">
                  <UserRoundCheck className="text-red-500" size={30} />
                  <h2 className="mt-4 text-3xl font-bold">Our commitment</h2>
                  <p className="mt-4 leading-8 text-brand-muted">Networkers is built around trusted professional relationships. We handle personal information with care and use it only for legitimate platform, community, safety, and legal purposes.</p>
                </div>
                <div className="divide-y divide-brand-border/20">
                  {policySections.map((section) => (
                    <article key={section.id} id={section.id} className="scroll-mt-28 py-9 first:pt-9">
                      <h2 className="text-2xl font-bold text-brand-primary">{section.title}</h2>
                      <div className="mt-4 grid gap-4 leading-8 text-brand-muted">{section.content}</div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
