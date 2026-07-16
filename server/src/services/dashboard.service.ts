import { supabase } from "../config/supabase";

export const getDashboardStats = async () => {
  const { count: streetLights } = await supabase.from("street_lights").select("*", { count: "exact", head: true });
  const { count: complaints } = await supabase.from("complaints").select("*", { count: "exact", head: true });
  const { count: newComplaints } = await supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "NEW");
  const { count: completed } = await supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "COMPLETED");

  const { data: allRows } = await supabase
    .from("complaints")
    .select("fault_category, status, complaint_source, ward_number");

  const breakdownBy = (rows: any[], key: string) => {
    const result: Record<string, number> = {};
    rows.forEach((row) => {
      const k = String(row[key]);
      result[k] = (result[k] ?? 0) + 1;
    });
    return result;
  };

  const breakdowns = {
    fault_category: breakdownBy(allRows ?? [], "fault_category"),
    status: breakdownBy(allRows ?? [], "status"),
    complaint_source: breakdownBy(allRows ?? [], "complaint_source"),
    ward_number: breakdownBy(allRows ?? [], "ward_number"),
  };

  const { data: mslvlUsers } = await supabase.from("users").select("id, full_name").eq("role", "MSLVL").eq("is_active", true);
  const { data: assignedRows } = await supabase.from("complaints").select("assigned_mslvl_id, status").not("assigned_mslvl_id", "is", null);

  const mslvlWorkload = (mslvlUsers ?? []).map((u) => ({
    id: u.id,
    full_name: u.full_name,
    activeJobs: (assignedRows ?? []).filter((c) => c.assigned_mslvl_id === u.id && !["COMPLETED", "CLOSED", "VERIFIED"].includes(c.status)).length,
  }));

  return {
    streetLights: streetLights ?? 0,
    complaints: complaints ?? 0,
    newComplaints: newComplaints ?? 0,
    completed: completed ?? 0,
    breakdowns,
    mslvlWorkload,
  };
};