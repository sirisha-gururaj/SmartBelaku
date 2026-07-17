import { supabase } from "../config/supabase";

interface CrewMember {
  name: string;
  phone: string;
}

export const submitCrewLog = async (mslvlId: string, crewMembers: CrewMember[]) => {
  return await supabase
    .from("crew_logs")
    .upsert(
      { mslvl_id: mslvlId, log_date: new Date().toISOString().slice(0, 10), crew_members: crewMembers },
      { onConflict: "mslvl_id,log_date" }
    )
    .select()
    .single();
};

export const getTodayCrewLog = async (mslvlId: string) => {
  return await supabase
    .from("crew_logs")
    .select("*")
    .eq("mslvl_id", mslvlId)
    .eq("log_date", new Date().toISOString().slice(0, 10))
    .maybeSingle();
};

const VALID_ACTIVITIES = [
  "Wire Change", "Light Replacement", "Switch Problem", "Jump Repair",
  "Rust Removal", "Pole Damage", "Cable Fault", "Other",
];

export const startWork = async (complaintId: string, mslvlId: string) => {
  const { data: complaint, error: fetchError } = await supabase
    .from("complaints")
    .select("id, status, assigned_mslvl_id")
    .eq("id", complaintId)
    .single();

  if (fetchError || !complaint) return { data: null, error: fetchError ?? { message: "Complaint not found" } };
  if (complaint.assigned_mslvl_id !== mslvlId) return { data: null, error: { message: "This job is not assigned to you" } };
  if (complaint.status !== "ASSIGNED") return { data: null, error: { message: `Cannot start work — current status is ${complaint.status}` } };

  return await supabase
    .from("complaints")
    .update({ status: "IN_PROGRESS", work_started_at: new Date().toISOString() })
    .eq("id", complaintId)
    .select()
    .single();
};

interface MarkCompletedInput {
  repair_activities: string[];
  repair_notes?: string;
  remarks?: string;
}

export const markCompleted = async (complaintId: string, mslvlId: string, input: MarkCompletedInput) => {
  if (!input.repair_activities || input.repair_activities.length === 0) {
    return { data: null, error: { message: "At least one repair activity is required" } };
  }
  const invalid = input.repair_activities.filter((a) => !VALID_ACTIVITIES.includes(a));
  if (invalid.length > 0) {
    return { data: null, error: { message: `Invalid repair activities: ${invalid.join(", ")}` } };
  }

  const { data: complaint, error: fetchError } = await supabase
    .from("complaints")
    .select("id, status, assigned_mslvl_id")
    .eq("id", complaintId)
    .single();

  if (fetchError || !complaint) return { data: null, error: fetchError ?? { message: "Complaint not found" } };
  if (complaint.assigned_mslvl_id !== mslvlId) return { data: null, error: { message: "This job is not assigned to you" } };
  if (complaint.status !== "IN_PROGRESS") return { data: null, error: { message: `Cannot mark completed — current status is ${complaint.status}` } };

  return await supabase
    .from("complaints")
    .update({
      status: "COMPLETED",
      repair_activities: input.repair_activities,
      repair_notes: input.repair_notes?.trim() || null,
      remarks: input.remarks?.trim() || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", complaintId)
    .select()
    .single();
};

export const verifyAndClose = async (complaintId: string, adminId: string) => {
  const { data: complaint, error: fetchError } = await supabase
    .from("complaints")
    .select("id, status")
    .eq("id", complaintId)
    .single();

  if (fetchError || !complaint) return { data: null, error: fetchError ?? { message: "Complaint not found" } };
  if (complaint.status !== "COMPLETED") return { data: null, error: { message: `Cannot verify — current status is ${complaint.status}` } };

  const now = new Date().toISOString();
  return await supabase
    .from("complaints")
    .update({ status: "CLOSED", verified_at: now, verified_by: adminId, closed_at: now })
    .eq("id", complaintId)
    .select()
    .single();
};