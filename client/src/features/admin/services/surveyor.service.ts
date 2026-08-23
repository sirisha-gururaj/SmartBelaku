import api from "../../../services/api";

export interface SurveyorAccount {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  totalSurveys: number;
}

export const getSurveyorAccounts = async (): Promise<SurveyorAccount[]> => {
  const res = await api.get("/admin/surveyor");
  return res.data;
};

export interface CreateSurveyorPayload {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export const createSurveyorAccount = async (payload: CreateSurveyorPayload) => {
  const res = await api.post("/admin/surveyor", payload);
  return res.data.user;
};
