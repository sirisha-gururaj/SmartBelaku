import { supabase } from "../config/supabase";

export const getDashboardStats = async () => {
  const { count: streetLights } = await supabase
    .from("street_lights")
    .select("*", { count: "exact", head: true });

  const { count: complaints } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true });

  const { data: recentComplaints } = await supabase
    .from("complaints")
    .select(
      "id, complaint_number, citizen_name, area, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    streetLights: streetLights ?? 0,
    complaints: complaints ?? 0,
    recentComplaints: recentComplaints ?? [],
  };
};