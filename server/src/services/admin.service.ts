import bcrypt from "bcrypt";
import { supabase } from "../config/supabase";

interface CreateMslvlInput {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export const createMslvlUser = async ({ full_name, email, phone, password }: CreateMslvlInput) => {
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({
      full_name,
      email,
      phone: phone || null,
      password_hash,
      role: "MSLVL",
      is_active: true,
    })
    .select("id, full_name, email, phone, role, is_active, created_at")
    .single();

  if (error) {
    console.error("Failed to create MSLVL account:", error);
    if (error.code === "23505") {
      throw new Error("An account with this email or phone already exists");
    }
    throw new Error("Failed to create MSLVL account");
  }

  return data;
};

export const listMslvlUsers = async () => {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, full_name, email, phone, is_active, created_at")
    .eq("role", "MSLVL")
    .order("created_at", { ascending: true });

  if (error || !users) return { data: users, error };

  const { data: assignedRows } = await supabase
    .from("complaints")
    .select("assigned_mslvl_id, status")
    .not("assigned_mslvl_id", "is", null);

  const withCounts = users.map((u) => ({
    ...u,
    activeJobs: (assignedRows ?? []).filter((c) => c.assigned_mslvl_id === u.id && !["COMPLETED", "CLOSED", "VERIFIED"].includes(c.status)).length,
    totalJobs: (assignedRows ?? []).filter((c) => c.assigned_mslvl_id === u.id).length,
  }));

  return { data: withCounts, error: null };
};

export const getMslvlCrewDetail = async (mslvlId: string) => {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, full_name, email, phone, is_active, created_at")
    .eq("id", mslvlId)
    .eq("role", "MSLVL")
    .single();

  if (userError || !user) {
    return { data: null, error: userError ?? { message: "MSLVL account not found" } };
  }

  const { data: complaints, error: complaintsError } = await supabase
    .from("complaints")
    .select("id, complaint_number, area, ward_number, fault_category, status, assigned_at, created_at")
    .eq("assigned_mslvl_id", mslvlId)
    .order("assigned_at", { ascending: false });

  return {
    data: { ...user, complaints: complaints ?? [] },
    error: complaintsError,
  };
};