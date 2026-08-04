import api,{unwrap} from "./axios";
export const publicDashboardApi={get:(page=0,month,year)=>api.get("/public-dashboard",{params:{page,month,year}}).then(unwrap)};
