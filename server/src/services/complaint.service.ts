import { supabase } from "../config/supabase";

export const getComplaints = async () => {
  return await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
};

interface NewComplaintPayload {
  citizen_name: string;
  contact_number: string;
  ward_number: number;
  area: string;
  landmark: string;
  fault_category: string;
  description: string;
  complaint_source: string;
  status: string;
}

export const createComplaint = async (payload: NewComplaintPayload) => {
  return await supabase
    .from("complaints")
    .insert([payload])
    .select("id, complaint_number, citizen_name, area, status, created_at")
    .single();
};

export const getComplaintByNumber = async (complaintNumber: string) => {
  return await supabase
    .from("complaints")
    .select("complaint_number, status, area, ward_number, fault_category, created_at, updated_at")
    .eq("complaint_number", complaintNumber)
    .single();
};  

export const assignComplaint = async (complaintId: string, mslvlId: string) => {
  const { data: mslvlUser, error: userError } = await supabase
    .from("users")
    .select("id, role, is_active")
    .eq("id", mslvlId)
    .single();

  if (userError || !mslvlUser || mslvlUser.role !== "MSLVL" || !mslvlUser.is_active) {
    return { data: null, error: { message: "Invalid or inactive MSLVL account" } };
  }

  return await supabase
    .from("complaints")
    .update({
      assigned_mslvl_id: mslvlId,
      status: "ASSIGNED",
      assigned_at: new Date().toISOString(),
    })
    .eq("id", complaintId)
    .select("id, complaint_number, status, assigned_mslvl_id, assigned_at")
    .single();
};

export const getAssignedComplaints = async (mslvlId: string) => {
  return await supabase
    .from("complaints")
    .select("*")
    .eq("assigned_mslvl_id", mslvlId)
    .order("assigned_at", { ascending: false });
};

export const getNotifications = async () => {
  return await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
};

export const getUnreadNotificationCount = async () => {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  return count ?? 0;
};

export const markNotificationRead = async (id: string) => {
  return await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single();
};

export const markAllNotificationsRead = async () => {
  return await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
};