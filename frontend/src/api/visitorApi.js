import api,{unwrap} from "./axios";
export const visitorApi={all:()=>api.get("/admin/visitors").then(unwrap),create:payload=>api.post("/admin/visitors",payload).then(unwrap),update:(id,payload)=>api.put(`/admin/visitors/${id}`,payload).then(unwrap),confirmPayment:id=>api.put(`/admin/visitors/${id}/confirm-payment`).then(unwrap),remove:id=>api.delete(`/admin/visitors/${id}`).then(unwrap)};
