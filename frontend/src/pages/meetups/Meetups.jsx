import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MeetupCard from "../../components/MeetupCard.jsx";
import { meetupApi } from "../../api/meetupApi";
import EmptyState from "../../components/EmptyState.jsx";

export default function Meetups() {
  const [items, setItems] = useState([]);
  const load = () => meetupApi.all().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function join(id) { await meetupApi.join(id); toast.success("Meetup joined"); }
  return <div className="space-y-4"><h2 className="text-2xl font-black">Meetups</h2>{items.map((m) => <MeetupCard key={m.id} meetup={m} action={<button className="btn-primary" onClick={() => join(m.id)}>Join meetup</button>} />)}{items.length === 0 && <EmptyState title="No meetups scheduled" message="Upcoming networking meetups will appear here when the admin publishes them." />}</div>;
}
