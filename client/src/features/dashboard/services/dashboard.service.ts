import api from "../../../services/api";

export interface DashboardResponse {
  streetLights: number;
  complaints: number;
  newComplaints: number;
  completed: number;
  breakdowns: {
    fault_category: Record<string, number>;
    status: Record<string, number>;
    complaint_source: Record<string, number>;
    ward_number: Record<string, number>;
  };
  mslvlWorkload: { id: string; full_name: string; activeJobs: number }[];
}

export const getDashboardStats = async () => {
  const response = await api.get<DashboardResponse>("/dashboard");
  return response.data;
};