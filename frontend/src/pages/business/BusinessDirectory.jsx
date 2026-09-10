import {useEffect,useMemo,useState} from "react";
import {BriefcaseBusiness,Search} from "lucide-react";
import {Link} from "react-router-dom";
import toast from "react-hot-toast";
import BusinessCard from "../../components/BusinessCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import {businessApi} from "../../api/businessApi";
import {connectionApi} from "../../api/connectionApi";

const PAGE_SIZE=10;
export default function BusinessDirectory(){
 const[items,setItems]=useState([]),[mine,setMine]=useState(null),[filters,setFilters]=useState({keyword:"",city:"",category:""}),[page,setPage]=useState(1),[loading,setLoading]=useState(true);
 const load=()=>Promise.all([businessApi.all(),businessApi.my()]).then(([all,my])=>{setItems(Array.isArray(all)?all:[]);setMine(my||null)}).catch(()=>toast.error("Could not load business profiles")).finally(()=>setLoading(false));useEffect(()=>{load()},[]);
 const categories=useMemo(()=>[...new Set(items.map(i=>i.category).filter(Boolean))].sort(),[items]);
 const filtered=useMemo(()=>items.filter(b=>{const key=filters.keyword.trim().toLowerCase(),city=filters.city.trim().toLowerCase();const text=`${b.businessName||""} ${b.ownerName||""} ${b.user?.fullName||""}`.toLowerCase();return(!key||text.includes(key))&&(!city||b.city?.toLowerCase().includes(city))&&(!filters.category||b.category===filters.category)}),[items,filters]);
 useEffect(()=>setPage(1),[filters]);const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),visible=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
 async function connect(userId){try{await connectionApi.send(userId);toast.success("Connection request sent")}catch(e){toast.error(e.response?.data?.message||"Could not send request")}}
 return <div className="page-shell"><header><p className="page-kicker">Member directory</p><h1 className="page-title">Business <span className="text-brand-accent">Profiles</span></h1><p className="mt-2 text-sm text-brand-muted">Discover businesses and owners across the Networkers community.</p></header>
  <section><div className="mb-3 flex items-center gap-2"><BriefcaseBusiness className="text-red-500"/><h2 className="text-xl font-black">Your business card</h2></div>{mine?<div className="max-w-2xl"><BusinessCard business={mine} featured action={<Link className="btn-muted" to="/profile?tab=business">Edit business card</Link>}/></div>:<div className="rounded-3xl border border-dashed border-red-500/40 bg-red-500/5 p-7"><h3 className="text-xl font-black">Create your business card</h3><p className="mt-2 text-sm text-brand-muted">Complete your business profile to make your card visible to other members.</p><Link className="btn-primary mt-5" to="/profile?tab=business">Create your business card</Link></div>}</section>
  <section className="card p-5"><h2 className="text-xl font-black">All business cards</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={17}/><input className="field !pl-10" placeholder="Member or business name" value={filters.keyword} onChange={e=>setFilters({...filters,keyword:e.target.value})}/></label><input className="field" placeholder="City" value={filters.city} onChange={e=>setFilters({...filters,city:e.target.value})}/><select className="field" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}><option value="">All business types</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div></section>
  {!loading&&visible.length>0&&<div className="grid gap-4 lg:grid-cols-2">{visible.map(b=><BusinessCard key={b.id} business={b} action={mine?.user?.id!==b.user?.id&&b.user?.id?<button className="btn-primary" onClick={()=>connect(b.user.id)}>Connect</button>:null}/>)}</div>}
  {!loading&&visible.length===0&&<EmptyState title="No business cards found" message="Try another member name, business name, city, or business type." actionLabel="Create your business card" actionTo="/profile?tab=business"/>}
  {pageCount>1&&<nav className="flex items-center justify-center gap-3"><button className="btn-muted" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="text-sm font-bold text-brand-muted">Page {page} of {pageCount}</span><button className="btn-muted" disabled={page===pageCount} onClick={()=>setPage(p=>p+1)}>Next</button></nav>}
 </div>
}
