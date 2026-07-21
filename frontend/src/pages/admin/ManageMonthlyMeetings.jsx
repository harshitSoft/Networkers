import {useEffect,useState} from "react";
import toast from "react-hot-toast";
import {chapterApi} from "../../api/chapterApi";
import {monthlyMeetingApi} from "../../api/meetingApi";
import EmptyState from "../../components/EmptyState";

export default function ManageMonthlyMeetings(){
  const[chapters,setChapters]=useState([]);const[chapterId,setChapterId]=useState("");const[month,setMonth]=useState(new Date().toISOString().slice(0,7));const[items,setItems]=useState([]);const[loading,setLoading]=useState(false);
  useEffect(()=>{chapterApi.all().then(data=>{setChapters(data);if(data[0])setChapterId(String(data[0].id))})},[]);
  useEffect(()=>{if(chapterId)monthlyMeetingApi.adminOverview(chapterId,month).then(setItems).catch(()=>setItems([]))},[chapterId,month]);
  async function generate(){if(items.length&&!confirm("Groups already exist for this month. Regenerating replaces groups, meetings, and their comments. Continue?"))return;setLoading(true);try{const data=await monthlyMeetingApi.regenerate(chapterId,month);setItems(data);toast.success(`Meetings generated for ${month}`)}catch(e){toast.error(e.response?.data?.message||"Could not generate meetings")}finally{setLoading(false)}}
  return <div className="space-y-5"><header><p className="page-kicker">Automation oversight</p><h1 className="page-title">Monthly <span className="text-brand-accent">Meetings</span></h1><p className="mt-2 text-sm text-brand-muted">Automatic generation runs on the first day of every month. Select a chapter and month to generate immediately for testing.</p></header>
    <div className="card flex flex-wrap gap-3 p-4"><select className="field max-w-sm" value={chapterId} onChange={e=>setChapterId(e.target.value)}><option value="">Select chapter</option>{chapters.map(c=><option value={c.id} key={c.id}>{c.chapterName}</option>)}</select><input className="field max-w-[190px]" type="month" value={month} onChange={e=>setMonth(e.target.value)}/><button className="btn-primary" disabled={!chapterId||!month||loading} onClick={generate}>{loading?"Generating...":items.length?"Regenerate selected month":"Generate selected month now"}</button></div>
    <div className="grid gap-4 md:grid-cols-2">{items.map(m=><article className="glass-card rounded-3xl p-5" key={m.id}><div className="flex justify-between"><h2 className="text-xl font-bold">Group {m.groupNumber}</h2><span className="status-pill">{m.status}</span></div><p className="mt-4 font-bold text-brand-accent">Host: {m.host.name}</p><p className="mt-2 text-sm text-brand-muted">{m.date} · {m.time} · {m.venue||"Venue not decided"}</p><p className="mt-3 text-sm">{m.members.length} members · {m.comments.length} comments</p><div className="mt-3 flex flex-wrap gap-2">{m.members.map(member=><span className="rounded-full bg-brand-panel px-3 py-1 text-xs" key={member.id}>{member.name}</span>)}</div></article>)}</div>
    {items.length===0&&<EmptyState title="No groups generated" message="Choose the month and click Generate selected month now."/>}
  </div>
}
