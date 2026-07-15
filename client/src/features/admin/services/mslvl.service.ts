import api from "../../../services/api";

export interface MslvlAccount {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export const getMslvlAccounts = async (): Promise<MslvlAccount[]> => {
  const res = await api.get("/admin/mslvl");
  return res.data;
};

export interface CreateMslvlPayload {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export const createMslvlAccount = async (payload: CreateMslvlPayload) => {
  const res = await api.post("/admin/mslvl", payload);
  return res.data.user;
};