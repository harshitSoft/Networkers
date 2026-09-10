import api,{unwrap} from "./axios";
export const galleryApi={all:()=>api.get("/gallery").then(unwrap),update:(slot,file)=>{const body=new FormData();body.append("file",file);return api.put(`/gallery/${slot}`,body,{headers:{"Content-Type":"multipart/form-data"}}).then(unwrap)}};
