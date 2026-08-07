import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { meetupApi } from "../../api/meetupApi";
import EmptyState from "../../components/EmptyState.jsx";
export default function ManageMeetups() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ status: "UPCOMING" });
  const [creating, setCreating] = useState(false);
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const load = () => meetupApi.all().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function submit(e) { e.preventDefault(); if (creating) return; if (!form.date || form.date < today) return toast.error("Past-date meetups cannot be created"); setCreating(true); try { await meetupApi.create(form); toast.success("Meetup created"); setForm({ status: "UPCOMING" }); load(); } catch (error) { toast.error(error.response?.data?.message || "Could not create meetup"); } finally { setCreating(false); } }
  const regularFields=["title","description","date","venue","city","maxAttendees","agenda"];
  return <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><form onSubmit={submit} className="card space-y-3 p-5"><h2 className="text-xl font-black">Create Meetup</h2>{regularFields.map((f) => <input key={f} className="field" min={f === "date" ? today : undefined} required={["title","date"].includes(f)} type={f === "date" ? "date" : "text"} placeholder={f} value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: f === "maxAttendees" ? Number(e.target.value) : e.target.value })} />)}<Time12Field label="Start time" value={form.startTime||""} onChange={value=>setForm({...form,startTime:value})}/><Time12Field label="End time" value={form.endTime||""} onChange={value=>setForm({...form,endTime:value})}/><button disabled={creating} className="btn-primary">{creating ? "Creating..." : "Create"}</button></form><div className="space-y-3">{items.map((m) => <div className="card p-4" key={m.id}><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{m.title}</h3><span className="text-xs font-black text-red-600">{m.status}</span></div><p className="text-sm text-slate-500">{m.date} - {m.city}</p></div>)}{items.length === 0 && <EmptyState title="No meetups" message="Create the first networking meetup for members." />}</div></div>;
}

function Time12Field({label,value,onChange}){
  const parse=raw=>{if(!raw)return ["","","AM"];const[h,m]=raw.split(":");const n=Number(h);return[String(n%12||12).padStart(2,"0"),m,n>=12?"PM":"AM"]};
  const initial=parse(value);const[hour,setHour]=useState(initial[0]);const[minute,setMinute]=useState(initial[1]);const[period,setPeriod]=useState(initial[2]);
  useEffect(()=>{if(!value){setHour("");setMinute("");setPeriod("AM")}},[value]);
  const update=(nextHour,nextMinute,nextPeriod)=>{setHour(nextHour);setMinute(nextMinute);setPeriod(nextPeriod);if(!nextHour||nextMinute==="")return;const h=(Number(nextHour)%12)+(nextPeriod==="PM"?12:0);onChange(`${String(h).padStart(2,"0")}:${nextMinute}`)};
  return <fieldset className="rounded-xl border border-brand-border/20 p-3"><legend className="px-1 text-sm font-bold text-brand-muted">{label}</legend><div className="grid grid-cols-3 gap-2"><select required className="field" aria-label={`${label} hour`} value={hour} onChange={e=>update(e.target.value,minute,period)}><option value="">Hour</option>{Array.from({length:12},(_,i)=>String(i+1).padStart(2,"0")).map(h=><option key={h}>{h}</option>)}</select><select required className="field" aria-label={`${label} minute`} value={minute} onChange={e=>update(hour,e.target.value,period)}><option value="">Minute</option>{Array.from({length:60},(_,i)=>String(i).padStart(2,"0")).map(m=><option key={m}>{m}</option>)}</select><select required className="field" aria-label={`${label} AM or PM`} value={period} onChange={e=>update(hour,minute,e.target.value)}><option>AM</option><option>PM</option></select></div></fieldset>
}
