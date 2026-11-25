import api, { unwrap } from "./axios";
export const testimonialApi={
 dashboard:()=>api.get("/testimonials/dashboard").then(unwrap),
 given:(params)=>api.get("/testimonials/given",{params}).then(unwrap),
 received:(params)=>api.get("/testimonials/received",{params}).then(unwrap),
 members:(name)=>api.get("/testimonials/members",{params:{name}}).then(unwrap),
 create:(payload)=>api.post("/testimonials",payload).then(unwrap),
 one:(id)=>api.get(`/testimonials/${id}`).then(unwrap),
 publicForMember:(memberId)=>api.get(`/testimonials/member/${memberId}`).then(unwrap),
 report:(id,reason)=>api.post(`/testimonials/${id}/report`,{reason}).then(unwrap),
 admin:(params)=>api.get("/testimonials/admin",{params}).then(unwrap),
 adminDashboard:()=>api.get("/testimonials/admin/dashboard").then(unwrap),
 reports:()=>api.get("/testimonials/admin/reports").then(unwrap),
 moderate:(id,payload)=>api.put(`/testimonials/admin/${id}/moderate`,payload).then(unwrap),
 resolveReport:(id)=>api.put(`/testimonials/admin/reports/${id}/resolve`).then(unwrap),
};
