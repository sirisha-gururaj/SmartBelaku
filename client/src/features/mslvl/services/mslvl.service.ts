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
  description: string | null;
  priority: string;
  status: string;
  repair_activities: string[] | null;
  repair_notes: string | null;
  remarks: string | null;
  assigned_at: string;
  work_started_at: string | null;
  completed_at: string | null;
}

export const getAssignedComplaints = async (): Promise<AssignedComplaint[]> => {
  const res = await api.get("/complaints/mine/assigned");
  return res.data;
};

export interface CrewMember {
  name: string;
  phone: string;
}

export interface CrewLog {
  id: string;
  log_date: string;
  crew_members: CrewMember[];
}

export const getTodayCrewLog = async (): Promise<CrewLog | null> => {
  const res = await api.get("/mslvl/crew-log/today");
  return res.data;
};

export const submitCrewLog = async (crewMembers: CrewMember[]): Promise<CrewLog> => {
  const res = await api.post("/mslvl/crew-log", { crew_members: crewMembers });
  return res.data;
};

export const startWork = async (complaintId: string) => {
  const res = await api.patch(`/mslvl/${complaintId}/start`);
  return res.data;
};

export interface MarkCompletedInput {
  repair_activities: string[];
  repair_notes?: string;
  remarks?: string;
}

export const markCompleted = async (complaintId: string, input: MarkCompletedInput) => {
  const res = await api.patch(`/mslvl/${complaintId}/complete`, input);
  return res.data;
};