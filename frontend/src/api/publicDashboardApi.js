import api,{unwrap} from "./axios";
export const publicDashboardApi={get:(page=0)=>api.get("/public-dashboard",{params:{page}}).then(unwrap)};
