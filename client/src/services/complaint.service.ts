import api from "./api";

export const getComplaints = async () => {
  const response = await api.get("/complaints");
  return response.data;
};

export const createComplaint = async (data: any) => {
  const response = await api.post("/complaints", data);
  return response.data;
};