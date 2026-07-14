import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { AdminTable } from "./ManageUsers.jsx";
export default function ManageBusinesses() {
  const [items, setItems] = useState([]);
  const load = () => adminApi.businesses().then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function verify(id) { await adminApi.verify(id); load(); }
  return <AdminTable title="Manage Businesses" items={items} render={(b) => <><td>{b.businessName}</td><td>{b.category}</td><td>{b.city}</td><td><button className="btn-muted" onClick={() => verify(b.id)}>{b.verified ? "Verified" : "Verify"}</button></td></>} />;
}
