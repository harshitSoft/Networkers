import {Building2,Mail,MapPin,Phone,ShieldCheck} from "lucide-react";

export default function BusinessCard({business,action,featured=false}){
 const owner=business.ownerName||business.user?.fullName||"Business owner";
 const image=business.logoUrl||business.user?.profileImage;
 const phone=business.businessPhone||business.user?.mobile;
 const email=business.businessEmail||business.user?.email;
 return <article className={`relative overflow-hidden rounded-3xl border bg-brand-panel p-5 text-brand-primary shadow-premium ${featured?"border-red-500 ring-2 ring-red-500/20":"border-brand-border/20"}`}>
  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8b0000] via-[#ff1e1e] to-[#8b0000]"/>
  <div className="flex items-start gap-4"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-red-500/50 bg-red-500/10">{image?<img className="h-full w-full object-cover" src={image} alt={`${business.businessName} logo`}/>:<Building2 className="text-red-500" size={28}/>}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate text-xl font-black">{business.businessName||"Business profile"}</h3>{business.verified&&<ShieldCheck className="shrink-0 text-red-500" size={18}/>}</div><p className="mt-1 text-sm font-semibold text-brand-muted">{owner}</p>{business.category&&<span className="mt-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">{business.category}</span>}</div></div>
  <div className="mt-5 grid gap-2 text-sm text-brand-muted sm:grid-cols-2">{phone&&<a className="flex items-center gap-2 truncate hover:text-red-500" href={`tel:${phone}`}><Phone size={15}/>{phone}</a>}{email&&<a className="flex items-center gap-2 truncate hover:text-red-500" href={`mailto:${email}`}><Mail size={15}/>{email}</a>}{(business.city||business.address)&&<p className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 shrink-0" size={15}/><span>{[business.address,business.city,business.state].filter(Boolean).join(", ")}</span></p>}</div>
  {action&&<div className="mt-5 border-t border-brand-border/15 pt-4">{action}</div>}
 </article>
}
