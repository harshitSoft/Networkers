import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { tipApi } from "../../api/tipApi.js";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const categories = [["ALL", "All Categories"], ["NETWORKING", "Networking"], ["MEMBERSHIP", "Membership"], ["BNI_TECH", "BNI Tech"]];
const label = (value) => categories.find(([key]) => key === value)?.[1] || value;
const date = (value) => value ? new Date(value).toLocaleDateString() : "";

export default function Tips() {
  const { id } = useParams();
  const [category, setCategory] = useState("ALL");
  const [items, setItems] = useState([]);
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true; setLoading(true); setError("");
    (id ? tipApi.one(id).then(setTip) : tipApi.published(category).then(setItems))
      .catch((e) => { if (live) { setTip(null); setItems([]); setError(e.response?.status === 404 ? "This tip is unavailable." : "Could not load tips. Please try again."); } })
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [id, category]);
  if (id) return <div className="page-shell space-y-5"><Link className="btn-muted w-fit" to="/tips"><ArrowLeft size={17}/>Back to tips</Link>{loading?<Loader label="Loading tip"/>:error?<EmptyState title="Tip unavailable" message={error}/>:tip&&<article className="card mx-auto max-w-3xl overflow-hidden">{tip.imageUrl&&<img src={tip.imageUrl} alt="" className="max-h-[420px] w-full object-cover"/>}<div className="p-6 sm:p-10"><span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">{label(tip.category)}</span><h1 className="mt-5 text-3xl font-black sm:text-4xl">{tip.title}</h1><p className="mt-2 text-sm text-brand-muted">Published {date(tip.publishedAt)}</p>{tip.shortDescription&&<p className="mt-6 text-lg text-brand-muted">{tip.shortDescription}</p>}<div className="mt-8 whitespace-pre-wrap text-base leading-8 text-white/85">{tip.content}</div></div></article>}</div>;
  return <div className="page-shell space-y-6"><header><p className="page-kicker">Ideas to help you grow</p><h1 className="page-title"><Lightbulb className="inline text-red-400"/> Tips &amp; Updates</h1><p className="mt-2 text-sm text-brand-muted">Practical ideas from across the Networkers community.</p></header><div className="flex flex-wrap gap-2" role="group" aria-label="Filter tips by category">{categories.map(([key,name])=><button key={key} onClick={()=>setCategory(key)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category===key?"border-red-500 bg-red-500/15 text-red-300":"border-brand-border/20 text-brand-muted hover:border-red-500/40 hover:text-white"}`} aria-pressed={category===key}>{name}</button>)}</div>{loading?<Loader label="Loading tips"/>:error?<EmptyState title="Tips unavailable" message={error}/>:items.length===0?<EmptyState title="No tips yet" message="There are no published tips in this category yet."/>:<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(item=><Link key={item.id} to={`/tips/${item.id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:border-red-500/30">{item.imageUrl&&<img src={item.imageUrl} alt="" className="aspect-[16/9] w-full object-cover"/>}<div className="p-5"><span className="text-xs font-bold uppercase tracking-wide text-red-300">{label(item.category)}</span><h2 className="mt-2 text-xl font-bold group-hover:text-red-300">{item.title}</h2>{item.shortDescription&&<p className="mt-2 line-clamp-3 text-sm leading-6 text-brand-muted">{item.shortDescription}</p>}<p className="mt-4 text-xs text-brand-muted">{date(item.publishedAt)}</p><span className="mt-4 inline-block text-sm font-bold text-red-300">Read tip →</span></div></Link>)}</div>}</div>;
}
