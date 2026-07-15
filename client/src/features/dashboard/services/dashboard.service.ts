import api from "../../../services/api";

export interface DashboardResponse {
  streetLights: number;
  complaints: number;
  pending: number;
  completed: number;
  recentComplaints: {
    id: string;
    complaint_number: string;
    citizen_name: string;
    area: string;
    status: string;
  }[];
}

export const getDashboardStats = async () => {
  const response = await api.get<DashboardResponse>("/dashboard");
  return response.data;
};