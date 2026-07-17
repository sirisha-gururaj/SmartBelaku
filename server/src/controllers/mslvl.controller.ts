import { Request, Response } from "express";
import { submitCrewLog, getTodayCrewLog, startWork, markCompleted, verifyAndClose } from "../services/mslvl.service";

export const postCrewLog = async (req: Request, res: Response) => {
  const { crew_members } = req.body;
  if (!Array.isArray(crew_members) || crew_members.length === 0) {
    return res.status(400).json({ message: "crew_members must be a non-empty array" });
  }
  for (const m of crew_members) {
    if (!m.name || !m.phone) {
      return res.status(400).json({ message: "Each crew member needs a name and phone" });
    }
  }

  const { data, error } = await submitCrewLog(req.user!.id, crew_members);
  if (error) {
    console.error("Failed to submit crew log:", error);
    return res.status(500).json({ message: "Failed to submit crew log" });
  }
  return res.status(201).json(data);
};

export const fetchTodayCrewLog = async (req: Request, res: Response) => {
  const { data, error } = await getTodayCrewLog(req.user!.id);
  if (error) {
    console.error("Failed to fetch crew log:", error);
    return res.status(500).json({ message: "Failed to fetch crew log" });
  }
  return res.json(data);
};

export const postStartWork = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { data, error } = await startWork(id, req.user!.id);
  if (error || !data) {
    return res.status(400).json({ message: (error as any)?.message ?? "Failed to start work" });
  }
  return res.json(data);
};

export const postMarkCompleted = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { repair_activities, repair_notes, remarks } = req.body;
  const { data, error } = await markCompleted(id, req.user!.id, { repair_activities, repair_notes, remarks });
  if (error || !data) {
    return res.status(400).json({ message: (error as any)?.message ?? "Failed to mark completed" });
  }
  return res.json(data);
};

export const postVerifyClose = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { data, error } = await verifyAndClose(id, req.user!.id);
  if (error || !data) {
    return res.status(400).json({ message: (error as any)?.message ?? "Failed to verify and close" });
  }
  return res.json(data);
};