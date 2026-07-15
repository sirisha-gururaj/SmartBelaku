import { supabase } from "../config/supabase";

export const getDashboardStats = async () => {
  const { count: streetLights } = await supabase
    .from("street_lights")
    .select("*", { count: "exact", head: true });

  const { count: complaints } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true });

  const { count: newComplaints } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true })
    .eq("status", "NEW");

  const { count: completed } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true })
    .eq("status", "COMPLETED");

  // Fault category breakdown — small dataset, safe to aggregate in code for now
  const { data: faultRows } = await supabase
    .from("complaints")
    .select("fault_category");

  const faultCategoryBreakdown: Record<string, number> = {};
  (faultRows ?? []).forEach((row) => {
    faultCategoryBreakdown[row.fault_category] =
      (faultCategoryBreakdown[row.fault_category] ?? 0) + 1;
  });

  // MSLVL workload snapshot — active crews and their current open job count
  const { data: mslvlUsers } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "MSLVL")
    .eq("is_active", true);

  const { data: assignedRows } = await supabase
    .from("complaints")
    .select("assigned_mslvl_id, status")
    .not("assigned_mslvl_id", "is", null);

  const mslvlWorkload = (mslvlUsers ?? []).map((u) => {
    const activeJobs = (assignedRows ?? []).filter(
      (c) =>
        c.assigned_mslvl_id === u.id &&
        !["COMPLETED", "CLOSED", "VERIFIED"].includes(c.status)
    ).length;
    return { id: u.id, full_name: u.full_name, activeJobs };
  });

  return {
    streetLights: streetLights ?? 0,
    complaints: complaints ?? 0,
    newComplaints: newComplaints ?? 0,
    completed: completed ?? 0,
    faultCategoryBreakdown,
    mslvlWorkload,
  };
};