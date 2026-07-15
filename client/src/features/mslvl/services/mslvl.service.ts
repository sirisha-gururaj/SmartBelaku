import api from "../../../services/api";

export interface AssignedComplaint {
  id: string;
  complaint_number: string;
  citizen_name: string;
  contact_number: string;
  area: string;
  landmark: string;
  ward_number: number;
  fault_category: string;
  description: string;
  status: string;
  assigned_at: string;
}

export const getAssignedComplaints = async (): Promise<AssignedComplaint[]> => {
  const res = await api.get("/complaints/mine/assigned");
  return res.data;
};