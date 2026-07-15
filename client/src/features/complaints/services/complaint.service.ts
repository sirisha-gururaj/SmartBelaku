import api from "../../../services/api";

export const getComplaints = async () => {
  const response = await api.get("/complaints");
  return response.data;
};

export const createComplaint = async (data: any) => {
  const response = await api.post("/complaints", data);
  return response.data;
};

export const trackComplaint = async (complaintNumber: string) => {
  const res = await api.get(`/complaints/track/${complaintNumber}`);
  return res.data;
};

export const assignComplaint = async (complaintId: string, mslvlId: string) => {
  const res = await api.patch(`/complaints/${complaintId}/assign`, { mslvl_id: mslvlId });
  return res.data;
};