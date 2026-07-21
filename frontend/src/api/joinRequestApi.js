import api, { unwrap } from "./axios";
export const joinRequestApi = { submit:(payload)=>api.post("/join-requests",payload).then(unwrap) };
