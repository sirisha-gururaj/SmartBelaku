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
  return await supabase
    .from("users")
    .select("id, full_name, email, phone, is_active, created_at")
    .eq("role", "MSLVL")
    .order("created_at", { ascending: true });
};