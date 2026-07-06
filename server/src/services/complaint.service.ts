import { supabase } from "../config/supabase";

export const getComplaints = async () => {
  return await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
};

export const createComplaint = async (complaint: any) => {
  return await supabase
    .from("complaints")
    .insert([complaint])
    .select();
};